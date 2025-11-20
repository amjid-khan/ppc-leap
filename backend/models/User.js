import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 2,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, "Invalid Email"],
        },


        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
    },
    { timestamps: true }
);


// Password Hash
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// Compare Password Method
userSchema.methods.comparePassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};


export default mongoose.model("User", userSchema);