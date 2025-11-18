package com.example.todo_caled;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class TodoCaledApplication {

	public static void main(String[] args) {
		SpringApplication.run(TodoCaledApplication.class, args);
	}

}
