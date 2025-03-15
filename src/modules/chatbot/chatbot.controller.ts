import { Controller, Get, Post, Body} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { CreateChatbotDto } from './dto/create-chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('send-message')
  chatMessage(@Body() createChatbotDto: CreateChatbotDto) {
    return this.chatbotService.chatMessage(createChatbotDto);
  }

}
