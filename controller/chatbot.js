const { NlpManager } = require('node-nlp');
const fs = require('fs');
const manager = new NlpManager({ languages: ['es'] });

const data = fs.readFileSync('model.nlp', 'utf8');
manager.import(data);

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
        manager.addAnswer('es', 'greetings.hello', '¡Hola! Soy VetBot, tu asistente virtual de Vetconnect. \u000a Estoy aquí para ayudarte mientras esperas a que un veterinario esté disponible. Por favor, proporcióname algunos detalles sobre tu mascota y los síntomas que has observado\u000a¿Cuál es el nombre de tu mascota?\u000a¿Qué especie y raza es tu mascota?\u000a¿Cuál es la edad de tu mascota?\u000a¿Cuáles son los síntomas que has observado? Por favor, enuméralos.\u000a¿Desde cuándo has notado estos síntomas?\u000a¿Has observado algún cambio en el comportamiento o hábitos de tu mascota? Por favor, descríbelo.\u000aTambién puedes adjuntar fotos para ayudar a evaluar la condición de tu mascota.\u000a¡Gracias por confiar en Vetconnect!');

        // Intents y respuestas específicos de la clínica veterinaria
        manager.addDocument('es', 'cuáles son sus horarios', 'clinic.hours');
        manager.addDocument('es', 'qué horarios tienen', 'clinic.hours');
        manager.addDocument('es', 'horarios de atención', 'clinic.hours');

        // Respuestas para intents específicos de la clínica veterinaria
        manager.addAnswer('es', 'clinic.hours', 'Nuestro horario de atención es de lunes a sábados de 9:00 a 21:00 y los domingos  de 9:00 a 14:00.');
        manager.addAnswer('es', 'clinic.hours', 'Atendemos de lunes a sábados de 9:00 a 21:00 y los domingos de 9:00 a 14:00.');

        (async() => {
            await manager.train();
            manager.save("./model.nlp", true);
            console.log("La IA ha sido entrenada");
            resolve(true);
        })();

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