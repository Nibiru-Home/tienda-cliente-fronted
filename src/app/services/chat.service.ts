import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HTTPService } from './http.service';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private httpService: HTTPService) {}

  stream(message: string, history: ChatMessage[]): Observable<string> {
    const url = this.httpService.buildUrl('/api/chat/stream');

    return new Observable<string>((subscriber) => {
      const controller = new AbortController();

      fetch(url, {
        method: 'POST',
        headers: {
          'c-content-type': 'application/json',
          Accept: 'text/event-stream'
        },
        body: JSON.stringify({ message, history }),
        signal: controller.signal
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Chat stream failed');
          }

          if (!response.body) {
            throw new Error('Streaming body not available');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const processBuffer = (flush = false) => {
            let boundaryIndex = buffer.indexOf('\n\n');
            while (boundaryIndex !== -1) {
              const chunk = buffer.slice(0, boundaryIndex);
              buffer = buffer.slice(boundaryIndex + 2);
              this.handleChunk(chunk, subscriber);
              boundaryIndex = buffer.indexOf('\n\n');
            }

            if (flush && buffer.trim().length > 0) {
              this.handleChunk(buffer, subscriber);
              buffer = '';
            }
          };

          const read = (): void => {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  processBuffer(true);
                  subscriber.complete();
                  return;
                }

                buffer += decoder.decode(value, { stream: true });
                processBuffer();
                read();
              })
              .catch((error) => subscriber.error(error));
          };

          read();
        })
        .catch((error) => subscriber.error(error));

      return () => controller.abort();
    });
  }

  private handleChunk(chunk: string, subscriber: { next: (value: string) => void }) {
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (!line.startsWith('data:')) {
        continue;
      }

      const data = line.replace(/^data:\\s?/, '').trim();
      if (!data || data === '[DONE]') {
        continue;
      }

      subscriber.next(data);
    }
  }
}
