import dns from "node:dns";

const currentServers = dns.getServers();

console.log("Node DNS servers before:", currentServers);

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

console.log("Node DNS servers after:", dns.getServers());