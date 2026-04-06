package sn.gestion_hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class Gestion_hospitalApplication 
{

	public static void main(String[] args) 
	{
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(e ->
            System.setProperty(e.getKey(), e.getValue())
        );
		SpringApplication.run(Gestion_hospitalApplication.class, args);
	}

}
