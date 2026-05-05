package com.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@SpringBootApplication
@RestController
@RequestMapping("/api/quiz")
public class App {

    // In-memory database
    private final Map<String, Quiz> quizzes = new ConcurrentHashMap<>();

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    // Generate a random 5-character string for the code
    private String generateCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        Random rnd = new Random();
        while (code.length() < 5) { // length of the random string.
            int index = (int) (rnd.nextFloat() * chars.length());
            code.append(chars.charAt(index));
        }
        return code.toString();
    }

    // 1. Recruiter creates a new quiz and gets a code
    @PostMapping
    public ResponseEntity<Map<String, String>> createQuiz() {
        String code = generateCode();
        while (quizzes.containsKey(code)) {
            code = generateCode(); // ensure unique
        }
        quizzes.put(code, new Quiz(code));
        return ResponseEntity.ok(Map.of("code", code));
    }

    // 2. Recruiter adds a question to a specific quiz code
    @PostMapping("/{code}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable String code, @RequestBody Question question) {
        Quiz quiz = quizzes.get(code.toUpperCase());
        if (quiz == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Quiz not found"));
        }
        question.setId(quiz.getQuestions().size() + 1);
        quiz.getQuestions().add(question);
        return ResponseEntity.ok(Map.of("message", "Question added successfully"));
    }

    // 3. Student fetches questions using the quiz code
    @GetMapping("/{code}/questions")
    public ResponseEntity<?> getQuestions(@PathVariable String code) {
        Quiz quiz = quizzes.get(code.toUpperCase());
        if (quiz == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Invalid Quiz Code"));
        }
        if (quiz.getQuestions().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "This quiz has no questions yet!"));
        }
        return ResponseEntity.ok(quiz.getQuestions());
    }

    // --- Domain Models ---

    public static class Quiz {
        private String code;
        private List<Question> questions = new ArrayList<>();

        public Quiz(String code) {
            this.code = code;
        }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public List<Question> getQuestions() { return questions; }
        public void setQuestions(List<Question> questions) { this.questions = questions; }
    }

    public static class Question {
        private int id;
        private String question;
        private List<String> options;
        private int answer; // index of the correct option

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public int getAnswer() { return answer; }
        public void setAnswer(int answer) { this.answer = answer; }
    }
}