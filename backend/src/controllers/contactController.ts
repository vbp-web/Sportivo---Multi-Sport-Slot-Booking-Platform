import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import Contact from '../models/Contact';

/**
 * @route   POST /api/contact
 * @desc    Submit contact form and send email
 * @access  Public
 */
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            res.status(400).json({
                success: false,
                message: 'Please provide name, email and message'
            });
            return;
        }

        // 1. Save to Database
        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        // 2. Send Email
        console.log('Sending email using:', process.env.EMAIL_USER);
        console.log('Password length:', process.env.EMAIL_PASSWORD?.length);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'oneverce1011@gmail.com',
                pass: process.env.EMAIL_PASSWORD // Your Gmail App Password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'oneverce1011@gmail.com',
            to: 'oneverce1011@gmail.com',
            subject: `Contact Form: ${subject || 'New Inquiry'}`,
            text: `
                New message from Contact Form:
                
                Name: ${name}
                Email: ${email}
                Subject: ${subject}
                
                Message:
                ${message}
            `
        };

        // We don't want to block the response if email fails, 
        // but we'll try to send it
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email send error:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully',
            data: contact
        });

    } catch (error: any) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message
        });
    }
};
