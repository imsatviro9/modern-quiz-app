package com.project;

import java.util.Scanner;

public class App {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int score = 0;

        System.out.println("=== Online Quiz System ===");

        System.out.println("Q1: Capital of India?");
        System.out.println("1. Mumbai  2. Delhi  3. Kolkata");
        if(sc.nextInt() == 2) score++;

        System.out.println("Q2: 2 + 2 = ?");
        System.out.println("1. 3  2. 4  3. 5");
        if(sc.nextInt() == 2) score++;

        System.out.println("Q3: Java is?");
        System.out.println("1. Language  2. OS  3. Browser");
        if(sc.nextInt() == 1) score++;

        System.out.println("Score: " + score + "/3");

        if(score >= 2)
            System.out.println("PASS");
        else
            System.out.println("FAIL");
    }
}