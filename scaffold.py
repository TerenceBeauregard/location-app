import os
from pathlib import Path

WORKSPACE = "/Users/lacreme/Documents/EFREI/ING2/Architecture des SI/Projet/location-app"

SERVICES = {
    "config-server": {"port": 8888, "package": "com.rental.config"},
    "eureka-server": {"port": 8761, "package": "com.rental.eureka"},
    "api-gateway": {"port": 8080, "package": "com.rental.gateway"},
    "auth-service": {"port": 8081, "package": "com.rental.auth"},
    "user-service": {"port": 8082, "package": "com.rental.user"},
    "listing-service": {"port": 8083, "package": "com.rental.listing"},
    "booking-service": {"port": 8084, "package": "com.rental.booking"},
    "notification-service": {"port": 8085, "package": "com.rental.notification"}
}

pom_template = """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
\txsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
\t<modelVersion>4.0.0</modelVersion>
\t<parent>
\t\t<groupId>org.springframework.boot</groupId>
\t\t<artifactId>spring-boot-starter-parent</artifactId>
\t\t<version>3.2.4</version>
\t\t<relativePath/>
\t</parent>
\t<groupId>com.rental</groupId>
\t<artifactId>{service}</artifactId>
\t<version>0.0.1-SNAPSHOT</version>
\t<name>{service}</name>
\t<description>{service}</description>
\t<properties>
\t\t<java.version>21</java.version>
\t\t<spring-cloud.version>2023.0.1</spring-cloud.version>
\t</properties>
\t<dependencies>
{dependencies}
\t\t<dependency>
\t\t\t<groupId>org.springframework.boot</groupId>
\t\t\t<artifactId>spring-boot-starter-test</artifactId>
\t\t\t<scope>test</scope>
\t\t</dependency>
\t</dependencies>
\t<dependencyManagement>
\t\t<dependencies>
\t\t\t<dependency>
\t\t\t\t<groupId>org.springframework.cloud</groupId>
\t\t\t\t<artifactId>spring-cloud-dependencies</artifactId>
\t\t\t\t<version>${spring-cloud.version}</version>
\t\t\t\t<type>pom</type>
\t\t\t\t<scope>import</scope>
\t\t\t</dependency>
\t\t</dependencies>
\t</dependencyManagement>
\t<build>
\t\t<plugins>
\t\t\t<plugin>
\t\t\t\t<groupId>org.springframework.boot</groupId>
\t\t\t\t<artifactId>spring-boot-maven-plugin</artifactId>
\t\t\t</plugin>
\t\t</plugins>
\t</build>
</project>
"""

deps_common = """        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>"""

deps_db = """        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>"""

deps_rabbitmq = """        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-amqp</artifactId>
        </dependency>"""

deps_gateway = """        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>"""

deps_eureka = """        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>"""

deps_config = """        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-config-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>"""

deps_security = """        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>"""


dockerfile_template = """FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE {port}
ENTRYPOINT ["java", "-jar", "app.jar"]
"""

application_yml_template = """server:
  port: {port}

spring:
  application:
    name: {service}
  config:
    import: "optional:configserver:http://config-server:8888"

eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
  instance:
    prefer-ip-address: true

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
"""

def generate_pom(service):
    if service == "config-server":
        return pom_template.replace("{service}", service).replace("{dependencies}", deps_config)
    elif service == "eureka-server":
        return pom_template.replace("{service}", service).replace("{dependencies}", deps_eureka)
    elif service == "api-gateway":
        return pom_template.replace("{service}", service).replace("{dependencies}", deps_gateway)
    elif service == "auth-service":
        return pom_template.replace("{service}", service).replace("{dependencies}", deps_common + "\\n" + deps_db + "\\n" + deps_security)
    elif service == "notification-service":
        return pom_template.replace("{service}", service).replace("{dependencies}", deps_common + "\\n" + deps_rabbitmq)
    elif service in ["listing-service", "booking-service"]:
        return pom_template.replace("{service}", service).replace("{dependencies}", deps_common + "\\n" + deps_db + "\\n" + deps_rabbitmq)
    else: # user-service
        return pom_template.replace("{service}", service).replace("{dependencies}", deps_common + "\\n" + deps_db)

def generate_main_class_content(service, package):
    class_name = "".join(word.capitalize() for word in service.split("-")) + "Application"
    annotations = "@SpringBootApplication\\n"
    if service == "eureka-server":
        annotations += "@EnableEurekaServer\\n"
    elif service == "config-server":
        annotations += "@EnableConfigServer\\n"

    imports = "import org.springframework.boot.SpringApplication;\\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\\n"
    if service == "eureka-server":
        imports += "import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;\\n"
    elif service == "config-server":
        imports += "import org.springframework.cloud.config.server.EnableConfigServer;\\n"

    return f"""package {package};

{imports}
{annotations}public class {class_name} {{
    public static void main(String[] args) {{
        SpringApplication.run({class_name}.class, args);
    }}
}}
"""

def main():
    os.chdir(WORKSPACE)
    for service, meta in SERVICES.items():
        port = meta["port"]
        pkg = meta["package"]
        pkg_path = pkg.replace(".", "/")
        Path(f"{service}/src/main/java/{pkg_path}").mkdir(parents=True, exist_ok=True)
        Path(f"{service}/src/main/resources").mkdir(parents=True, exist_ok=True)
        
        # Maven wrapper (fake for simplicity of structure, usually generated by start.spring.io)
        # We will create actual bash files for the wrapper.
        Path(f"{service}/.mvn/wrapper").mkdir(parents=True, exist_ok=True)
        with open(f"{service}/mvnw", "w") as f:
            f.write("#!/bin/sh\\n./mvnw \"$@\"")
        os.chmod(f"{service}/mvnw", 0o755)

        with open(f"{service}/pom.xml", "w") as f:
            f.write(generate_pom(service))
        with open(f"{service}/Dockerfile", "w") as f:
            f.write(dockerfile_template.format(port=port))
            
        yml_content = application_yml_template.format(service=service, port=port)
        if service == "config-server":
             yml_content = f"server:\\n  port: {port}\\nspring:\\n  application:\\n    name: {service}\\n  profiles:\\n    active: native\\n"
        elif service == "eureka-server":
             yml_content = f'server:\\n  port: {port}\\nspring:\\n  application:\\n    name: {service}\\n  config:\\n    import: "optional:configserver:http://config-server:8888"\\neureka:\\n  client:\\n    register-with-eureka: false\\n    fetch-registry: false\\n'
        
        if service in ["listing-service", "booking-service", "notification-service"]:
            yml_content += "\\nspring.rabbitmq.host: rabbitmq\\nspring.rabbitmq.port: 5672\\nspring.rabbitmq.username: guest\\nspring.rabbitmq.password: guest\\n"
            
        if service in ["auth-service", "user-service", "listing-service", "booking-service"]:
            yml_content += f"\\nspring.datasource.url: jdbc:postgresql://{service}-db:5432/{service.replace('-', '_')}\\nspring.datasource.username: postgres\\nspring.datasource.password: postgres\\nspring.jpa.hibernate.ddl-auto: update\\nspring.jpa.show-sql: true\\n"

        with open(f"{service}/src/main/resources/application.yml", "w") as f:
            f.write(yml_content)

        with open(f"{service}/src/main/java/{pkg_path}/{''.join(w.capitalize() for w in service.split('-')) + 'Application'}.java", "w") as f:
            f.write(generate_main_class_content(service, pkg))

        # Additional folders
        for folder in ["controller", "service", "repository", "model", "dto", "config"]:
            if service not in ["config-server", "eureka-server", "api-gateway"]:
                Path(f"{service}/src/main/java/{pkg_path}/{folder}").mkdir(parents=True, exist_ok=True)

    # Specific things for Notification Service
    notif_pkg = "com/rental/notification"
    Path(f"notification-service/src/main/java/{notif_pkg}/listener").mkdir(parents=True, exist_ok=True)
    with open(f"notification-service/src/main/java/{notif_pkg}/listener/RabbitMQListener.java", "w") as f:
        f.write("""package com.rental.notification.listener;
import com.rental.notification.dto.BookingEvent;
import com.rental.notification.dto.ListingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQListener {
    private static final Logger log = LoggerFactory.getLogger(RabbitMQListener.class);

    @RabbitListener(queues = "booking.confirmed")
    public void receiveBookingEvent(BookingEvent event) {
        log.info("Received booking event: {}", event);
    }

    @RabbitListener(queues = "listing.created")
    public void receiveListingEvent(ListingEvent event) {
        log.info("Received listing event: {}", event);
    }
}
""")
    
    with open(f"notification-service/src/main/java/{notif_pkg}/dto/BookingEvent.java", "w") as f:
        f.write("""package com.rental.notification.dto;
import lombok.Data;
@Data
public class BookingEvent {
    private String bookingId;
    private String listingId;
    private String userId;
    private String status;
}
""")

    with open(f"notification-service/src/main/java/{notif_pkg}/dto/ListingEvent.java", "w") as f:
        f.write("""package com.rental.notification.dto;
import lombok.Data;
@Data
public class ListingEvent {
    private String listingId;
    private String title;
    private String ownerId;
}
""")

if __name__ == "__main__":
    main()
