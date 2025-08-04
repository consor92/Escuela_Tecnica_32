FROM php:5.6-apache

# Instalar extensiones necesarias
RUN docker-php-ext-install mysqli pdo pdo_mysql
RUN a2enmod rewrite

# Evitar el warning de ServerName
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Copiar el código de la página PHP
COPY src/ /var/www/html/

# Cambiar el puerto de Apache a 8080
RUN sed -i 's/80/8080/' /etc/apache2/ports.conf && \
    sed -i 's/:80/:8080/' /etc/apache2/sites-available/000-default.conf

RUN mkdir -p /var/lib/php/session && chmod -R 777 /var/lib/php/session
ENV PHP_SESSION_SAVE_PATH="/var/lib/php/session"

# Permisos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 8080

CMD ["apache2-foreground"]
