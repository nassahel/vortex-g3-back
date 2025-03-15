import { Injectable } from '@nestjs/common';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { normalizeText } from 'src/utils/chatbot/chatbot.utils';
import { chatbotResponses } from './chatbot.data'

@Injectable()
export class ChatbotService {
  private failQuestions = 0;

  chatMessage(createChatbotDto: CreateChatbotDto) {
    const { message } = createChatbotDto;

    const formattedMessage = normalizeText(message);
    const arrayWords = formattedMessage.split(" ");



    for (const word of arrayWords) {
      const respuestaEncontrada = chatbotResponses.find(res =>
        res.keywords.some(keyword => normalizeText(keyword) === word)
      );

      if (respuestaEncontrada) {
        this.failQuestions = 0
        return { message: respuestaEncontrada.response };
      }
    }

    this.failQuestions += 1;

    if (this.failQuestions === 3) {
      this.failQuestions = 0;
      return { message: "Ups! Parece que no encuentras lo que buscas! Recuerda que también puedes comunicarte a nuestros números de telefono!" }
    }

    return { message: "Lo siento, no entiendo tu consulta. ¿Puedes ser más específico?" };
  }



}
