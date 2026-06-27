import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { type } from "os";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    avatar: {
       url:{
        type: String,
        default: ""
       },
       publicId:{
        type: String,
        default: ""
       }
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen:{
        type:Date,
        default: Date.now,
    }
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save",async function name() {
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password, 10);
})

// compare password and generate tokens-custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);