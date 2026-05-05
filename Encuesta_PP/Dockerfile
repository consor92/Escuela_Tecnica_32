FROM php:8.2-apache

# Instalar extensiones necesarias para PDO MariaDB
RUN docker-php-ext-install pdo pdo_mysql

# Habilitar mod_rewrite para Apache
RUN a2enmod rewrite

# Cambiar el DocumentRoot a /var/www/html/public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configurar el directorio de trabajo
WORKDIR /var/www/html

# Ajustar permisos para que Apache pueda leer los archivos
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html
