import { ServerChannel } from "ssh2";

export interface ClientLogger {
  sendMessage(message: string): void;
}

export class ConnectedClientLogger implements ClientLogger {
  _stream: ServerChannel;
  constructor(stream: ServerChannel) {
    this._stream = stream;
  }
  sendMessage(message: string): void {
    this._stream.write(message + "\r\n");
  }

  resend(otherLogger: ClientLogger) {
    if (otherLogger instanceof DisconnectedClientLogger) {
      otherLogger._messages.forEach((message) => this.sendMessage(message));
    }
  }
}
export class DisconnectedClientLogger implements ClientLogger {
  _messages = [] as string[];
  sendMessage(message: string): void {
    this._messages.push(message);
  }
}
