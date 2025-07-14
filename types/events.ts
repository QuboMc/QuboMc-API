export type MinecraftEvent = {
  command: string;
};

export type DiscordSendMessageEvent = {
  channelId: string;
  message: string;
};

export type DiscordBotInfoEvent = {
  username: string;
  id: string;
};

export type ModEvent = {
  event: string;
  data: any;
}; 