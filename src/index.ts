import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GetDslTool } from "./tools/get-dsl.js";
import { GetComponentLinkTool } from "./tools/get-component-link.js";
import { GetMetaTool } from "./tools/get-meta.js";
import { GetComponentWorkflowTool } from "./tools/get-component-workflow.js";
import { GetVersionTool } from "./tools/get-version.js";
import type { ServerConfig } from "./utils/api.js";

// 导出配置模式，用于 Smithery 自动生成配置表单
export const configSchema = z.object({
  token: z.string().describe("MasterGo API token"),
  url: z
    .string()
    .default("https://mastergo.com")
    .describe("API base URL"),
  rules: z
    .array(z.string())
    .optional()
    .describe("Rules to apply"),
  debug: z
    .boolean()
    .default(false)
    .describe("Enable debug mode"),
  noRule: z
    .boolean()
    .default(false)
    .describe("Disable rules"),
});

// 导出 createServer 函数，Smithery 要求
export default function createServer({ config }: { config: z.infer<typeof configSchema> }) {
  const serverConfig: ServerConfig = {
    token: config.token,
    url: config.url,
    rules: config.rules,
    debug: config.debug,
    noRule: config.noRule,
  };

  if (serverConfig.debug) {
    console.log("Debug information:");
    console.log(`Token: ${serverConfig.token ? "set" : "not set"}`);
    console.log(`API URL: ${serverConfig.url || "default"}`);
    console.log(`Rules: ${serverConfig.rules && serverConfig.rules.length > 0 ? serverConfig.rules.join(", ") : "none"}`);
    console.log(`No Rule: ${serverConfig.noRule ? "enabled" : "disabled"}`);
    console.log(`Debug mode: enabled`);
  }

  // 创建服务器实例
  const server = new McpServer({
    name: "MasterGoMcpServer",
    version: "0.1.2",
  });

  // 注册工具，传入配置
  new GetVersionTool().register(server);
  new GetDslTool(serverConfig).register(server);
  new GetComponentLinkTool(serverConfig).register(server);
  new GetMetaTool(serverConfig).register(server);
  new GetComponentWorkflowTool(serverConfig).register(server);

  // 返回服务器对象
  return server.server;
}
