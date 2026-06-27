import nodemailer from "nodemailer";

export const sendMail = async (to: string, subject: string, text: string) => {
    let transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "27dd5f7488725a",
            pass: "c58a00087f189c"
        }
    });

    const mailOptions = {
        from: '"GraphQL API" <api@graphql.com>',
        to,
        subject,
        text
    };

    try {
        const info = await transport.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};