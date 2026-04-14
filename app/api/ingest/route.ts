import { NextResponse } from 'next/server';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

/**
 * GOOSE INGEST SERVICE (v1.1 Alpha)
 * -------------------------------
 * Connects via IMAP, fetches ONLY the latest mail, and normalizes for Triage.
 * Refactored to prevent socket timeouts on large inboxes.
 */

export async function POST(req: Request) {
  let activeClient: ImapFlow | null = null;

  try {
    // 1. Parse body ONCE
    const { email, appPassword } = await req.json();

    if (!email || !appPassword) {
      return NextResponse.json({ error: 'Credentials required' }, { status: 400 });
    }

    // 2. Initialize IMAP Client
    activeClient = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: {
        user: email,
        pass: appPassword,
      },
      logger: false,
      socketTimeout: 30000, // 30s timeout
    });

    // Handle asynchronous errors to prevent crashes
    activeClient.on('error', (err) => {
      console.error('IMAP Client Error:', err);
    });

    await activeClient.connect();

    // 3. OPEN INBOX & FETCH
    let lock = await activeClient.getMailboxLock('INBOX');
    const emails = [];

    try {
      // Get message count to avoid fetching entire inbox
      // activeClient.mailbox can be false if not selected, though lock ensures it is.
      const mailbox = activeClient.mailbox;
      const totalMessages = (mailbox && typeof mailbox !== 'boolean') ? mailbox.exists : 0;
      
      if (totalMessages === 0) {
        // No emails
      } else {
        // Calculate range for last 10 messages: `(Total-9):*`
        // e.g., if 100 messages, fetch 91:*; if 5 messages, fetch 1:*
        const startSeq = Math.max(1, totalMessages - 9);
        const fetchRange = `${startSeq}:*`;
        
        console.log(`Fetching range: ${fetchRange} (Total: ${totalMessages})`);

        for await (let msg of activeClient.fetch(fetchRange, { source: true, envelope: true })) {
          if (!msg.source || !msg.envelope) continue;

          try {
            const parsed = await simpleParser(msg.source) as any;
            
            emails.push({
              messageId: msg.envelope.messageId,
              from: parsed.from?.text || msg.envelope.from?.[0]?.address,
              subject: parsed.subject || '(No Subject)',
              body: parsed.text || '', 
              date: msg.envelope.date,
              uid: msg.uid,
            });
          } catch (parseErr) {
            console.error('Parse error for msg:', msg.uid, parseErr);
             emails.push({
              messageId: msg.envelope.messageId,
              from: msg.envelope.from?.[0]?.address,
              subject: '(Parse Error)',
              body: 'Failed to parse email content.', 
              date: msg.envelope.date,
              uid: msg.uid,
            });
          }
        }
      }
    } finally {
      lock.release();
    }

    await activeClient.logout();

    // Sort by date desc (newest first) since IMAP returns ascending (oldest first) usually
    emails.reverse();

    return NextResponse.json({
      success: true,
      count: emails.length,
      data: emails,
    });

  } catch (error: any) {
    console.error('Ingest Error:', error);
    if (activeClient) activeClient.close(); // Ensure connection is closed

    if (error.message.includes('AUTHENTICATIONFAILED')) {
      return NextResponse.json({ error: 'Authentication failed. Check creds.' }, { status: 401 });
    }
    
    return NextResponse.json({ error: error.message || 'Failed to connect' }, { status: 500 });
  }
}