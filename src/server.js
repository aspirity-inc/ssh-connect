import { readFileSync } from "fs";
import { createServer as createHttpServer } from "http";
import { createServer as createTcpServer } from "net";
import { resolve as resolvePath, dirname } from "path";
import { fileURLToPath } from "url";
import SSH from "ssh2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sshServer = new SSH.Server(
  {
    hostKeys: [
      {
        key: readFileSync(resolvePath(__dirname, "keys/ssh.key")),
        passphrase: "qwerty",
      },
    ],
    greeting: "LOL 1",
    banner: "LOL 2",
    ident: "ssh-connect 1.0.0",
    // debug(info) {
    //   console.log(new Date(), "DEBUG", info);
    // },
  },
  (client, info) => {
    console.log("connected", info);

    client
      .on("authentication", (authCtx) => {
        console.log("client authentication", {
          username: authCtx.username,
          service: authCtx.service,
          method: authCtx.method,
        });
        switch (authCtx.method) {
          case "none":
            authCtx.accept();
            break;
          default:
            authCtx.reject();
            break;
        }
      })
      .on("ready", (...args) => {
        console.log("client ready", ...args);
      })
      .on("session", (accept, reject) => {
        console.log("client session");
        const session = accept()
          .on("pty", (accept) => accept?.())
          .on("close", () => {
            console.log("session closed");
          });

        session.on("shell", (accept) => {
          const stream = accept();
          stream.write("LOL > ");
          stream.on("data", (data) => {
            if (data.length === 1 && data[0] === 0x03) {
              stream.end("\r\nClosing...\r\n");
            }
          });
        });
      })
      .on("request", (accept, reject, name, info) => {
        console.log("client request", name, info);
        accept?.();
        const tcpServer = createTcpServer((socket) => {
          client.forwardOut(
            info.bindAddr,
            info.bindPort,
            socket.remoteAddress ?? "",
            socket.remotePort ?? 0,
            (err, stream) => {
              if (err) {
                console.log("[SSH]", err);
                return socket.end();
              }
              stream.pipe(socket).pipe(stream);
            }
          );
        });
        tcpServer.listen({ port: info.bindPort, host: info.bindAddr });
        client.on("end", () => {
          console.log("Closing TCP server");
          tcpServer.close();
        });
      });
  }
);

sshServer.listen(42222, "0.0.0.0", undefined, () => {
  console.log(`ssh server listening`, sshServer.address());
});

const httpServer = createHttpServer((req, res) => {
  res.end("hello there\n");
});
await httpServer.listen({ port: 3000 });
console.log(`http server listening`, httpServer.address());
