// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const disciplineData = [
  {
    id: "computacion",
    title: "Técnico en Computación",
    titleUppercase: "TÉCNICO EN COMPUTACIÓN",
    favicon: "/favicon.ico",
    resolucion: "Resolución N.º 4147/SSGECP/2012",
    text: "La Tecnicatura en Computación forma profesionales preparados para enfrentar los desafíos del mundo digital con herramientas sólidas, versátiles y actualizadas. Esta especialidad articula conocimientos de programación, redes, sistemas operativos y soporte técnico con una base integral en ciencias y ciudadanía. A lo largo de la carrera, los estudiantes adquieren capacidades clave para desempeñarse en distintos ámbitos productivos y tecnológicos. Es una formación estratégica para el presente y el futuro, en un sector en constante expansión y cambio. Se promueve la autonomía, el trabajo en equipo, la innovación y la capacidad de aprendizaje continuo. El egresado será capaz de integrarse a equipos de desarrollo, prestar asistencia técnica y desarrollar soluciones informáticas propias.",
    text_about_part1: "Durante el trayecto formativo, los estudiantes se introducen en la lógica de la computación, la resolución de problemas y la creación de soluciones tecnológicas. La carrera incluye contenidos en lenguajes de programación, mantenimiento y armado de PC, redes informáticas y diseño de software. Se busca que el estudiante no solo conozca herramientas, sino que entienda su funcionamiento y sea capaz de adaptarse a nuevas tecnologías. Se promueve un enfoque integral que vincula teoría y práctica. La articulación entre las materias técnicas, científicas y humanísticas permite una formación equilibrada y crítica.",
    text_about_part2: "Desde los primeros años se trabaja con proyectos prácticos y desafíos reales que estimulan el pensamiento computacional. Se incorporan prácticas de laboratorio, investigación y trabajo colaborativo para desarrollar habilidades técnicas y comunicacionales. La especialidad contempla aspectos éticos, de seguridad informática y de inclusión digital. Se favorece el uso de software libre y herramientas actualizadas para el desarrollo de aplicaciones y soluciones tecnológicas. Todo esto construye una base sólida para insertarse en el mundo del trabajo o continuar estudios superiores.",
    text_future_part1: "El Técnico en Computación está preparado para insertarse laboralmente en múltiples áreas como mantenimiento de equipos, soporte técnico, programación, instalación de redes y desarrollo de sistemas informáticos. Puede desempeñarse tanto en el sector público como privado, o generar sus propios emprendimientos tecnológicos. Además, puede continuar estudios en carreras universitarias afines como Ingeniería en Sistemas, Ciencias de la Computación, Seguridad Informática, entre otras. El campo laboral es amplio y dinámico, con alta demanda de perfiles técnicos capacitados.",
    text_future_part2: "La formación adquirida permite al egresado asumir roles en equipos interdisciplinarios, brindar asesoramiento técnico y desarrollar soluciones adaptadas a distintas necesidades. La capacidad de aprendizaje continuo, resolución de problemas y pensamiento lógico se convierte en una fortaleza clave para enfrentar los cambios tecnológicos. Su perfil está altamente valorado en empresas de tecnología, servicios, educación y organismos públicos. El futuro técnico podrá también liderar proyectos propios en el campo del software, consultoría y soporte de redes.",
    text_practice_part1: "Durante el ciclo superior, los estudiantes realizan Prácticas Profesionalizantes donde aplican los conocimientos adquiridos en entornos reales de trabajo. Esto les permite afianzar competencias técnicas y sociales necesarias para su futuro laboral. Estas prácticas pueden desarrollarse en empresas, instituciones educativas, organismos públicos o proyectos propios. Se busca que el estudiante asuma responsabilidades progresivas, trabaje en equipo y resuelva situaciones reales. Esta instancia representa un puente valioso entre la escuela y el mundo profesional.",
    imagesData: [
      {
        imgId: 1,
        url: 'https://source.unsplash.com/random/?forest',
        altDescription: ''
      },
      {
        imgId: 2,
        url: 'https://source.unsplash.com/random/?travel',
        altDescription: ''
      },
      {
        imgId: 3,
        url: 'https://source.unsplash.com/random/?food',
        altDescription: ''
      },
      {
        imgId: 4,
        url: 'https://source.unsplash.com/random/?fashion',
        altDescription: ''
      },
      {
        imgId: 5,
        url: 'https://source.unsplash.com/random/?nature',
        altDescription: ''
      },
      {
        imgId: 6,
        url: 'https://source.unsplash.com/random/?business',
        altDescription: ''
      },
      {
        imgId: 7,
        url: 'https://source.unsplash.com/random/?cars',
        altDescription: ''
      },
      {
        imgId: 8,
        url: 'https://source.unsplash.com/random/?health',
        altDescription: ''
      },
      {
        imgId: 9,
        url: 'https://source.unsplash.com/random/?people',
        altDescription: ''
      },
      {
        imgId: 10,
        url: 'https://source.unsplash.com/random/?animals',
        altDescription: ''
      }
    ],
    subjectPerYear: [
      {
        year: "Primer Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Historia", hs: "3 hs" },
          { name: "Geografía", hs: "3 hs" },
          { name: "Educación Física", hs: "3 hs" },
          { name: "Educación Ciudadana", hs: "2 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "4 hs" },
          { name: "Matemática", hs: "5 hs" },
          { name: "Biologia", hs: "2 hs" },
          { name: "Tecnología de la Representación", hs: "4 hs" },
          { name: "Educacion Artistica", hs: "2 hs" },
          { name: "Taller", hs: "12 hs" }
        ]
      },
      {
        year: "Segundo Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Historia", hs: "3 hs" },
          { name: "Geografía", hs: "3 hs" },
          { name: "Educación Física", hs: "3 hs" },
          { name: "Educación Ciudadana", hs: "2 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "4 hs" },
          { name: "Matemática", hs: "6 hs" },
          { name: "Física", hs: "4 hs" },
          { name: "Tecnología de la Representación", hs: "3 hs" },
          { name: "Biologia", hs: "3 hs" },
          { name: "Taller", hs: "12 hs" }
        ]
      },
      {
        year: "Tercer Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Historia", hs: "3 hs" },
          { name: "Geografía", hs: "3 hs" },
          { name: "Educación Física", hs: "3 hs" },
          { name: "Educación Ciudadana", hs: "2 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "4 hs" },
          { name: "Matemática", hs: "5 hs" },
          { name: "Física", hs: "4 hs" },
          { name: "Tecnología de la Representación", hs: "4 hs" },
          { name: "Química", hs: "3 hs" },
          { name: "Taller de Tecnología y del Control", hs: "4 hs" },
          { name: "Taller", hs: "8 hs" }
        ]
      },
      {
        year: "Cuarto Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Historia", hs: "2 hs" },
          { name: "Geografía", hs: "2 hs" },
          { name: "Educación Física", hs: "3 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "3 hs" },
          { name: "Matemática", hs: "4 hs" },
          { name: "Lab. de Algoritmos y Estructura de Datos", hs: "9 hs" },
          { name: "Base de Datos", hs: "6 hs" },
          { name: "Organización de Computadoras", hs: "7 hs" },
          { name: "Lógica Computacional", hs: "3 hs" },
          { name: "Proyecto Informático I", hs: "4 hs" }
        ]
      },
      {
        year: "Quinto Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Educación Física", hs: "3 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "3 hs" },
          { name: "Matemática", hs: "3 hs" },
          { name: "Economía y Gestión de las Organizaciones", hs: "3 hs" },
          { name: "Administración y Gestión de Base de Datos", hs: "6 hs" },
          { name: "Análisis de Sistemas", hs: "4 hs" },
          { name: "Lab. de Programación Orientada a Objetos", hs: "9 hs" },
          { name: "Redes", hs: "7 hs" },
          { name: "Proyecto Informático II", hs: "4 hs" }
        ]
      },
      {
        year: "Sexto Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Educación Física", hs: "3 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Ciudadanía y Trabajo", hs: "2 hs" },
          { name: "Ciencia y Tecnología", hs: "2 hs" },
          { name: "Matemática", hs: "4 hs" },
          { name: "Gestión de los Procesos Productivos", hs: "4 hs" },
          { name: "Desarrollo de Sistemas", hs: "6 hs" },
          { name: "Programación sobre Redes", hs: "6 hs" },
          { name: "Administración de Sistemas y de Redes", hs: "7 hs" },
          { name: "Prácticas Profesionalizantes", hs: "9 hs" }
        ]
      }
    ]
  },
  {
    id: "mecanica",
    title: "Técnico Mecánico",
    titleUppercase: "TÉCNICO MECÁNICO",
    favicon: "/favicon.ico",
    resolucion: "Resolución N.º 4144/SSGECP/2012",
    text: "La Tecnicatura Mecánica brinda una sólida formación técnica para intervenir en procesos industriales, de mantenimiento y diseño mecánico. El plan de estudios promueve capacidades para proyectar, montar, operar y mantener instalaciones y sistemas mecánicos, hidráulicos y neumáticos. Se prioriza una formación práctica, articulada con fundamentos científicos y tecnológicos. El estudiante desarrolla una comprensión integral de los procesos productivos y su vinculación con la industria y la tecnología. Es una carrera ideal para quienes buscan un perfil técnico sólido con amplia salida laboral. El egresado puede insertarse en distintos sectores productivos o continuar estudios superiores.",
    text_about_part1: "El trayecto formativo comienza con una sólida base en ciencias exactas, tecnologías y procesos mecánicos fundamentales. A medida que avanza la carrera, se incorporan contenidos sobre diseño mecánico, instalaciones industriales, automatización, control y mantenimiento. El estudiante trabaja con planos, herramientas, normas técnicas y sistemas CAD. Se desarrollan prácticas de laboratorio y talleres que fortalecen el saber hacer. Se fomenta el trabajo en equipo, el análisis crítico y la búsqueda de soluciones técnicas eficientes.",
    text_about_part2: "La formación del Técnico Mecánico está centrada en las necesidades reales del sector industrial. Se abordan proyectos interdisciplinarios y se trabaja con estándares de calidad y seguridad. El plan articula conocimientos teóricos con la resolución de problemas concretos del ámbito productivo. Los estudiantes aprenden a proyectar, ensamblar y mantener sistemas mecánicos, respetando normas ambientales y de seguridad. La formación también incluye nociones de gestión y emprendimientos, preparando al futuro técnico para múltiples desafíos profesionales.",
    text_future_part1: "El egresado puede desempeñarse en empresas industriales, talleres, servicios técnicos y mantenimiento, así como generar emprendimientos propios. Está habilitado para participar en proyectos de montaje, instalación, ensayo y mantenimiento de sistemas mecánicos complejos. Puede intervenir en el diseño de componentes, evaluar condiciones técnicas y colaborar en la optimización de procesos. El perfil técnico es altamente valorado en industrias manufactureras, metalúrgicas, energéticas y del transporte.",
    text_future_part2: "Gracias a su formación, puede continuar estudios en Ingeniería Mecánica, Electromecánica o carreras tecnológicas afines. También puede asumir funciones de supervisión, asesoramiento técnico y control de calidad. Su rol es clave para el desarrollo tecnológico de empresas y organizaciones. Tiene herramientas para generar soluciones innovadoras y trabajar en equipos interdisciplinarios. Su formación en normas de seguridad, medioambiente y calidad le permite actuar con responsabilidad profesional.",
    text_practice_part1: "Las Prácticas Profesionalizantes permiten aplicar los conocimientos en contextos reales del mundo del trabajo. Son una instancia clave para consolidar saberes técnicos y habilidades laborales. Pueden desarrollarse en empresas, talleres, fábricas o emprendimientos del sector. El estudiante asume un rol activo, participando en tareas concretas y desafíos reales. Esta experiencia fortalece la autonomía, la responsabilidad y la capacidad de trabajo colaborativo. Es un paso fundamental hacia una inserción laboral exitosa.",
    imagesData: [
      {
        imgId: 1,
        url: 'https://source.unsplash.com/random/?forest',
        altDescription: ''
      },
      {
        imgId: 2,
        url: 'https://source.unsplash.com/random/?travel',
        altDescription: ''
      },
      {
        imgId: 3,
        url: 'https://source.unsplash.com/random/?food',
        altDescription: ''
      },
      {
        imgId: 4,
        url: 'https://source.unsplash.com/random/?fashion',
        altDescription: ''
      },
      {
        imgId: 5,
        url: 'https://source.unsplash.com/random/?nature',
        altDescription: ''
      },
      {
        imgId: 6,
        url: 'https://source.unsplash.com/random/?business',
        altDescription: ''
      },
      {
        imgId: 7,
        url: 'https://source.unsplash.com/random/?cars',
        altDescription: ''
      },
      {
        imgId: 8,
        url: 'https://source.unsplash.com/random/?health',
        altDescription: ''
      },
      {
        imgId: 9,
        url: 'https://source.unsplash.com/random/?people',
        altDescription: ''
      },
      {
        imgId: 10,
        url: 'https://source.unsplash.com/random/?animals',
        altDescription: ''
      }
    ],
    subjectPerYear: [
      {
        year: "Primer Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Historia", hs: "3 hs" },
          { name: "Geografía", hs: "3 hs" },
          { name: "Educación Física", hs: "3 hs" },
          { name: "Educación Ciudadana", hs: "2 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "4 hs" },
          { name: "Matemática", hs: "5 hs" },
          { name: "Biologia", hs: "2 hs" },
          { name: "Tecnología de la Representación", hs: "4 hs" },
          { name: "Educacion Artistica", hs: "2 hs" },
          { name: "Taller", hs: "12 hs" }
        ]
      },
      {
        year: "Segundo Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Historia", hs: "3 hs" },
          { name: "Geografía", hs: "3 hs" },
          { name: "Educación Física", hs: "3 hs" },
          { name: "Educación Ciudadana", hs: "2 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "4 hs" },
          { name: "Matemática", hs: "6 hs" },
          { name: "Física", hs: "4 hs" },
          { name: "Tecnología de la Representación", hs: "3 hs" },
          { name: "Biologia", hs: "3 hs" },
          { name: "Taller", hs: "12 hs" }
        ]
      },
    {
      year: "Tercer Año",
      imageUrl: "https://source.unsplash.com/random/?forest",
      subjectName: [
        { name: "Educación Física", hs: "3 hs" },
        { name: "Inglés", hs: "3 hs" },
        { name: "Lengua y Literatura", hs: "4 hs" },
        { name: "Matemática", hs: "5 hs" },
        { name: "Historia", hs: "3 hs" },
        { name: "Geografia", hs: "3 hs" },
        { name: "Fisica", hs: "4 hs" },
        { name: "Tecnología de la Representación", hs: "4 hs" },
        { name: "Educación Ciudadana", hs: "2 hs" },
        { name: "Química", hs: "3 hs" },
        { name: "Taller", hs: "8 hs" },
        { name: "Talle de Tecnologia y del Control", hs: "4 hs" }
      ]
    },
    {
      year: "Cuarto Año",
      imageUrl: "https://source.unsplash.com/random/?forest",
      subjectName: [
        { name: "Educación Física", hs: "3 hs" },
        { name: "Ingles", hs: "3 hs" },
        { name: "Lengua y Literatura", hs: "3 hs" },
        { name: "Ciencia y Tecnología", hs: "2 hs" },
        { name: "Matemática", hs: "5 hs" },
        { name: "Dibujo Mecánico I", hs: "4 hs" },
        { name: "Hidráulica Industrial ", hs: "4 hs" },
        { name: "Electrotecnia", hs: "4 hs" },
        { name: "Química Aplicada", hs: "4 hs" },
        { name: "Tecnología de los Materialeso", hs: "3 hs" },
        { name: "Mecánica Técnica", hs: "4 hs" },
        { name: "Taller", hs: "12 hs" }
      ]
    },
    {
      year: "Quinto Año",
      imageUrl: "https://source.unsplash.com/random/?forest",
      subjectName: [
        { name: "Educación Física", hs: "3 hs" },
        { name: "Inglés", hs: "3 hs" },
        { name: "Lengua y Literatura", hs: "3 hs" },
        { name: "Matemática", hs: "3 hs" },
        { name: "Dibujo Mecánico II", hs: "4 hs" },
        { name: "Mecanismos", hs: "4 hs" },
        { name: "Resistencia de Materiales", hs: "6 hs" },
        { name: "Lab. de Ensayo de Materiales", hs: "4 hs" },
        { name: "Termodinámica", hs: "4 hs" },
        { name: "Taller", hs: "8 hs" },
        { name: "Prácticas Profesionalizantes", hs: "4 hs" }
      ]
    },
    {
      year: "Sexto Año",
      imageUrl: "https://source.unsplash.com/random/?forest",
      subjectName: [
        { name: "Educación Física", hs: "3 hs" },
        { name: "Economía y Gestión de las Organizaciones", hs: "3 hs" },
        { name: "Ciudadanía y Trabajo", hs: "2 hs" },
        { name: "Ciencia y Tecnología", hs: "2 hs" },
        { name: "Sistemas de Elevación y Transporte", hs: "3 hs" },
        { name: "Gestión de los Procesos Productivos", hs: "4 hs" },
        { name: "Instalaciones Industriales y Mantenimiento", hs: "2 hs" },
        { name: "Instalaciones Termomecánicas", hs: "4 hs" },
        { name: "Instrumentación y Ensayo de Máquinas y Motores", hs: "4 hs" },
        { name: "Proyecto Mecánico", hs: "4 hs" },
        { name: "Tecnología de Fabricación", hs: "2 hs" },
        { name: "Prácticas Profesionalizantes", hs: "5 hs" },
        { name: "Seguridad e Higiene Industrial y Medio Ambiente", hs: "2 hs" },
        { name: "Taller", "hs": "6 hs" }
      ]
    }       
    ]
  },
  {
    id: "automotores",
    title: "Técnico en Automotores",
    titleUppercase: "TÉCNICO EN AUTOMOTORES",
    favicon: "/favicon.ico",
    resolucion: "Resolución N.º 4152/SSGECP/2012",
    text: "La Tecnicatura en Automotores ofrece una formación integral para intervenir en procesos de diagnóstico, mantenimiento y reparación de vehículos. El plan de estudios combina saberes científicos, tecnológicos y técnicos específicos del sector automotriz. Los estudiantes adquieren competencias para analizar, proyectar y realizar tareas técnicas sobre motores, sistemas de transmisión, frenos, electrónica del automotor y mucho más. Es una carrera orientada a la práctica, con fuerte inserción laboral. Se desarrolla en laboratorios y talleres que simulan situaciones reales del rubro. El egresado está capacitado para desempeñarse con autonomía, creatividad y responsabilidad profesional.",
    text_about_part1: "A lo largo de la carrera se desarrollan conocimientos en sistemas mecánicos, hidráulicos, neumáticos y eléctricos que componen los vehículos modernos. El estudiante aprende a diagnosticar fallas, operar herramientas especializadas y efectuar reparaciones bajo estándares de calidad y seguridad. Se trabaja con tecnologías de última generación y se refuerza el enfoque preventivo del mantenimiento automotor. Además, se promueve la actitud investigativa, la resolución de problemas y el trabajo colaborativo.",
    text_about_part2: "La formación técnica incluye prácticas intensivas, proyectos interdisciplinarios y participación en simulaciones reales de taller. Se prioriza el desarrollo de habilidades prácticas en conjunto con conocimientos teóricos actualizados. El estudiante también se forma en normas de seguridad, impacto ambiental, documentación técnica y emprendimientos del rubro. La propuesta educativa permite construir un perfil técnico robusto, preparado para los desafíos actuales del sector automotor.",
    text_future_part1: "El Técnico en Automotores podrá desempeñarse en talleres, concesionarias, industrias automotrices o emprendimientos propios. Está capacitado para planificar mantenimientos, supervisar instalaciones, efectuar peritajes técnicos y participar en proyectos de mejora continua. Su formación le permite insertarse rápidamente en el mundo laboral o continuar estudios superiores en Ingeniería o carreras técnicas afines. La demanda de técnicos en este sector se mantiene en crecimiento.",
    text_future_part2: "Su perfil profesional incluye habilidades para gestionar recursos, realizar ensayos técnicos, interpretar manuales complejos y asesorar a clientes o usuarios. Tiene conocimientos específicos que lo convierten en un referente dentro del ámbito automotor. También puede actuar como capacitador, responsable técnico o jefe de taller. La versatilidad de su formación le permite adaptarse a diversos entornos de trabajo con una actitud proactiva y competente.",
    text_practice_part1: "Las Prácticas Profesionalizantes permiten al estudiante aplicar en contexto real todos los conocimientos adquiridos en la escuela. Son una oportunidad para fortalecer el vínculo con el sector productivo, asumir responsabilidades y consolidar competencias. Se realizan en talleres, empresas o espacios de formación, y están orientadas a mejorar la empleabilidad del egresado. Esta etapa permite conocer de primera mano el funcionamiento del mundo laboral automotor, afianzando la formación recibida.",
    imagesData: [
      {
        imgId: 1,
        url: 'https://source.unsplash.com/random/?forest',
        altDescription: ''
      },
      {
        imgId: 2,
        url: 'https://source.unsplash.com/random/?travel',
        altDescription: ''
      },
      {
        imgId: 3,
        url: 'https://source.unsplash.com/random/?food',
        altDescription: ''
      },
      {
        imgId: 4,
        url: 'https://source.unsplash.com/random/?fashion',
        altDescription: ''
      },
      {
        imgId: 5,
        url: 'https://source.unsplash.com/random/?nature',
        altDescription: ''
      },
      {
        imgId: 6,
        url: 'https://source.unsplash.com/random/?business',
        altDescription: ''
      },
      {
        imgId: 7,
        url: 'https://source.unsplash.com/random/?cars',
        altDescription: ''
      },
      {
        imgId: 8,
        url: 'https://source.unsplash.com/random/?health',
        altDescription: ''
      },
      {
        imgId: 9,
        url: 'https://source.unsplash.com/random/?people',
        altDescription: ''
      },
      {
        imgId: 10,
        url: 'https://source.unsplash.com/random/?animals',
        altDescription: ''
      }
    ],
    subjectPerYear: [
      {
        year: "Primer Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Historia", hs: "3 hs" },
          { name: "Geografía", hs: "3 hs" },
          { name: "Educación Física", hs: "3 hs" },
          { name: "Educación Ciudadana", hs: "2 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "4 hs" },
          { name: "Matemática", hs: "5 hs" },
          { name: "Biologia", hs: "2 hs" },
          { name: "Tecnología de la Representación", hs: "4 hs" },
          { name: "Educacion Artistica", hs: "2 hs" },
          { name: "Taller", hs: "12 hs" }
        ]
      },
      {
        year: "Segundo Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Historia", hs: "3 hs" },
          { name: "Geografía", hs: "3 hs" },
          { name: "Educación Física", hs: "3 hs" },
          { name: "Educación Ciudadana", hs: "2 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "4 hs" },
          { name: "Matemática", hs: "6 hs" },
          { name: "Física", hs: "4 hs" },
          { name: "Tecnología de la Representación", hs: "3 hs" },
          { name: "Biologia", hs: "3 hs" },
          { name: "Taller", hs: "12 hs" }
        ]
      },
      {
        year: "Teercer Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Historia", hs: "3 hs" },
          { name: "Geografía", hs: "3 hs" },
          { name: "Educación Física", hs: "3 hs" },
          { name: "Educación Ciudadana", hs: "2 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "4 hs" },
          { name: "Matemática", hs: "6 hs" },
          { name: "Física", hs: "4 hs" },
          { name: "Tecnología de la Representación", hs: "3 hs" },
          { name: "Biologia", hs: "3 hs" },
          { name: "Quimica", hs: "3 hs" },
          { name: "Taller", hs: "8 hs" },
          { name: "Taller de Tecnologia y del Control", hs: "4 hs" },
        ]
      },      
      {
        year: "Cuarto Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Educación Física", hs: "3 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Ciudadanía y Trabajo", hs: "2 hs" },
          { name: "Lengua y Literatura", hs: "3 hs" },
          { name: "Matemática", hs: "4 hs" },
          { name: "Mecánica", hs: "4 hs" },
          { name: "Estática y Resistencia de Materiales", hs: "6 hs" },
          { name: "Electricidad del Automotor", hs: "4 hs" },
          { name: "Mecanismos del Automotor y Fluídica", hs: "5 hs" },
          { name: "Taller de Automotores I", hs: "12 hs" }
        ]
      },
      {
        year: "Quinto Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Educación Física", hs: "3 hs" },
          { name: "Inglés", hs: "3 hs" },
          { name: "Lengua y Literatura", hs: "3 hs" },
          { name: "Matemática", hs: "3 hs" },
          { name: "Elementos de Máquinas", hs: "4 hs" },
          { name: "Tecnología de los Materiales", hs: "3 hs" },
          { name: "Termodinámica", hs: "4 hs" },
          { name: "Motores de Combustión Interna", hs: "6 hs" },
          { name: "Electrónica del Automotor", hs: "4 hs" },
          { name: "Dinámica del Automotor", hs: "3 hs" },
          { name: "Taller de Automotores II", hs: "12 hs" },
          { name: "Prácticas Profesionalizantes", hs: "4 hs" }
        ]
      },
      {
        year: "Sexto Año",
        imageUrl: "https://source.unsplash.com/random/?forest",
        subjectName: [
          { name: "Educación Física", hs: "3 hs" },
          { name: "Ciencia y Tecnología", hs: "2 hs" },
          { name: "Gestión de los Procesos Productivos", hs: "4 hs" },
          { name: "Economía y Gestión de las Organizaciones", hs: "3 hs" },
          { name: "Higiene y Seguridad Laboral", hs: "2 hs" },
          { name: "Dinámica de los Motores de Combustión Interna", hs: "6 hs" },
          { name: "Laboratorio de Ensayo de Motores", hs: "3 hs" },
          { name: "Diagnóstico de Sistemas del Automotor", hs: "4 hs" },
          { name: "Cálculo de Estructura y Mecanismos del Automotor", hs: "4 hs" },
          { name: "Vehículos Especiales", hs: "4 hs" },
          { name: "Taller de Automotores III", hs: "4 hs" },
          { name: "Prácticas Profesionalizantes", hs: "5 hs" }
        ]
      }
    ]
  }
]

export default disciplineData;