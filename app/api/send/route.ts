import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { 
      smtpEmail, 
      smtpPassword, 
      to, 
      subject, 
      html, 
      text 
    } = await req.json();

    if (!smtpEmail || !smtpPassword || !to || !subject) {
      return NextResponse.json({ error: 'Missing required configuration fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const info = await transporter.sendMail({
      from: smtpEmail,
      to,
      subject,
      text, // plain text body
      html, // html body
    });

    return NextResponse.json({ success: true, messageId: info.messageId });

  } catch (error: any) {
    console.error('Send Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
