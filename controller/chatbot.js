const { NlpManager } = require('node-nlp');
const manager = new NlpManager({ languages: ['es'] });

// 1 - Train the IA
async function trainChatBotIA() {
    return new Promise(async (resolve, reject) => {
        // Adds the utterances and intents for the NLP in Spanish

        // Saludos y despedidas
        manager.addDocument('es', 'adiós por ahora', 'greetings.bye');
        manager.addDocument('es', 'chau cuídate', 'greetings.bye');
        manager.addDocument('es', 'okay nos vemos luego', 'greetings.bye');
        manager.addDocument('es', 'adiós por ahora', 'greetings.bye');
        manager.addDocument('es', 'me tengo que ir', 'greetings.bye');
        manager.addDocument('es', 'hola', 'greetings.hello');
        manager.addDocument('es', 'buenos días', 'greetings.hello');
        manager.addDocument('es', 'buenas tardes', 'greetings.hello');

        // Respuestas para saludos y despedidas
        manager.addAnswer('es', 'greetings.bye', 'Hasta la próxima');
        manager.addAnswer('es', 'greetings.bye', '¡Nos vemos pronto!');
        manager.addAnswer('es', 'greetings.hello', '¡Hola!');
        manager.addAnswer('es', 'greetings.hello', '¡Saludos!');

        // Intents y respuestas específicos de la clínica veterinaria
        manager.addDocument('es', 'quiero hacer una cita', 'appointment.create');
        manager.addDocument('es', 'necesito una cita para mi mascota', 'appointment.create');
        manager.addDocument('es', 'puedo agendar una cita', 'appointment.create');

        manager.addDocument('es', 'cuáles son sus horarios', 'clinic.hours');
        manager.addDocument('es', 'qué horarios tienen', 'clinic.hours');
        manager.addDocument('es', 'horarios de atención', 'clinic.hours');

        manager.addDocument('es', 'dónde están ubicados', 'clinic.location');
        manager.addDocument('es', 'cuál es su dirección', 'clinic.location');
        manager.addDocument('es', 'cómo llegar a la clínica', 'clinic.location');

        // Respuestas para intents específicos de la clínica veterinaria
        manager.addAnswer('es', 'appointment.create', 'Claro, ¿para qué día y hora le gustaría hacer la cita?');
        manager.addAnswer('es', 'appointment.create', 'Podemos agendar una cita para su mascota. ¿Cuándo le gustaría venir?');

        manager.addAnswer('es', 'clinic.hours', 'Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00 y los sábados de 9:00 a 14:00.');
        manager.addAnswer('es', 'clinic.hours', 'Atendemos de lunes a viernes de 9:00 a 18:00 y los sábados de 9:00 a 14:00.');

        manager.addAnswer('es', 'clinic.location', 'Estamos ubicados en la calle Falsa 123, Springfield.');
        manager.addAnswer('es', 'clinic.location', 'Nuestra dirección es calle Falsa 123, Springfield.');

        // Entrenar y guardar el modelo
        await manager.train();
        manager.save();
        console.log("La IA ha sido entrenada");
        resolve(true);
    });
}

async function generateResponseAI(qsm) {
    return new Promise(async (resolve, reject) => {
        const response = await manager.process('es', qsm);
        resolve(response);
    });
}

module.exports = {
    generateResponseAI,
    trainChatBotIA
}