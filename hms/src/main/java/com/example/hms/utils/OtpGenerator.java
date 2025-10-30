
package com.example.hms.utils;

import java.util.Random;

public class OtpGenerator {
    public static String generateOtp() {
        // Generate a 6-digit number (100000 to 999999)
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}