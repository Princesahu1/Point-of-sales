package com.pos.service;

public interface OtpService {
    /** Generate OTP, log it (SMS stub), and return it for dev-mode display */
    String sendOtp(String mobileNumber);

    /** Returns true if OTP is valid and not expired */
    boolean verifyOtp(String mobileNumber, String otp);

    /** Reset password after OTP verified. Throws if OTP invalid/expired. */
    void resetPassword(String mobileNumber, String otp, String newPassword);
}
