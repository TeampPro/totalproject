package com.example.todo_caled;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class TodoCaledApplication {

	public static void main(String[] args) {
		SpringApplication.run(TodoCaledApplication.class, args);
	}

}
