import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());


// -------------------------
// MongoDB
// -------------------------

mongoose
    .connect('mongodb+srv://veer2238rajput:STrgrNlEXyfMZHBs@cluster0.3chkue4.mongodb.net/Contact?retryWrites=true&w=majority')
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));


// -------------------------
// Student Model
// -------------------------

const fileSchema = new mongoose.Schema({

    name: {
        type: String,
    },

    mobile: {
        type: String,
    },

    dob: Date,

    email: {
        type: String,
    },

    permanentAddress: String,

    presentAddress: String,

    pincode: String,

    collegeName: String,

    qualification: String,

    internshipDomain: String,

    duration: String,

    fees: {
        type: Number,
        default: 0
    },

    referredBy: String,

    photo: String,

    aadhar: String,

    startDate: Date,

    endDate: Date,

    certificateIssued: {
        type: Boolean,
        default: false
    },

    offerLetterIssued: {
        type: Boolean,
        default: false
    },

    internshipStatus: {
        type: String,
        enum: ["Active", "Completed", "Dropped"],
        default: "Active"
    }

}, {
    timestamps: true
});


// IMPORTANT:
// "Birthday" is the model name.
// Make sure this uses the SAME MongoDB collection
// that contains your students.

 const File = mongoose.model('File', fileSchema);


// -------------------------
// Birthday Email API
// -------------------------

app.get("/birthday-email-student", async (req, res) => {

    try {

        console.log("=================================");
        console.log("Birthday API started");
        console.log("=================================");


        // -------------------------
        // Email Template
        // -------------------------

        const templatePath = path.join(
            process.cwd(),
            "templates",
            "birthday.html"
        );


        // Check template exists

        if (!fs.existsSync(templatePath)) {

            throw new Error(
                `Birthday template not found: ${templatePath}`
            );

        }


        console.log(
            "Birthday template found:",
            templatePath
        );


        // -------------------------
        // Email Transporter
        // -------------------------

        const transporter = nodemailer.createTransport({

            host: "smtp.hostinger.com",

            port: 465,

            secure: true,

            auth: {
                user: 'info@v-extechsolution.in',
                pass: 'Hima@0409',
            },

        });


        // -------------------------
        // Get today's date in India
        // -------------------------

        const today = new Date();

        const indiaDate = new Intl.DateTimeFormat("en-IN", {

            timeZone: "Asia/Kolkata",

            day: "2-digit",

            month: "2-digit",

        }).formatToParts(today);


        const currentDay = Number(
            indiaDate.find(
                (item) => item.type === "day"
            ).value
        );


        const currentMonth = Number(
            indiaDate.find(
                (item) => item.type === "month"
            ).value
        );


        console.log(
            `Today's date: ${currentDay}/${currentMonth}`
        );


        // -------------------------
        // Get students
        // -------------------------

        const students = await Student.find({

            dob: {
                $exists: true,
                $ne: null,
            },

            email: {
                $exists: true,
                $ne: "",
            },

        });


        console.log(
            `Total students found: ${students.length}`
        );


        // -------------------------
        // Find today's birthdays
        // -------------------------

        const birthdayStudents = students.filter(
            (student) => {

                const dob = new Date(student.dob);


                const birthDay = dob.getUTCDate();

                const birthMonth =
                    dob.getUTCMonth() + 1;


                return (
                    birthDay === currentDay &&
                    birthMonth === currentMonth
                );

            }
        );


        console.log(
            `Birthday students: ${birthdayStudents.length}`
        );


        // -------------------------
        // Send Birthday Emails
        // -------------------------

        for (const student of birthdayStudents) {

            console.log(
                `Preparing birthday email for: ${student.name}`
            );


            // Read fresh template for each student

            let html = fs.readFileSync(
                templatePath,
                "utf-8"
            );


            // -------------------------
            // Replace Template Variables
            // -------------------------

            html = html

                .replace(
                    /{{name}}/g,
                    student.name || "Student"
                )

               

                


            // -------------------------
            // Mail Options
            // -------------------------

            const mailOptions = {

                from: 'info@v-extechsolution.in',

                to: student.email,

                subject:
                    `🎂 Happy Birthday, ${student.name}! — V-Ex Tech Solutions`,

                html: html,

            };


            // -------------------------
            // Send Email
            // -------------------------

            const info =
                await transporter.sendMail(
                    mailOptions
                );


            console.log(
                `Birthday email sent successfully to ${student.name}`,
                info.messageId
            );

        }


        // -------------------------
        // Response
        // -------------------------

        res.status(200).json({

            success: true,

            message:
                "Birthday check completed",

            date:
                `${currentDay}/${currentMonth}`,

            birthdayCount:
                birthdayStudents.length,

       

        });


    } catch (error) {

        console.error(
            "Birthday email error:",
            error
        );


        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

});


// -------------------------
// Start Server
// -------------------------

app.listen(
   8087,
    () => {

        console.log(
            `Server is running on port 8087`
        );

    }
);