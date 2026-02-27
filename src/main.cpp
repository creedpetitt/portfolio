#include <blaze/app.h>
#include <blaze/middleware.h>
#include <fstream>
#include <string>
#include <random>
#include <sstream>

using namespace blaze;

std::string generate_uuid() {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    static std::uniform_int_distribution<> dis(0, 15);
    const char* hex = "0123456789abcdef";
    std::stringstream ss;
    for (int i = 0; i < 32; ++i) {
        if (i == 8 || i == 12 || i == 16 || i == 20) ss << "-";
        ss << hex[dis(gen)];
    }
    return ss.str();
}

int main() {
    App app;
    app.log_to("server.log").log_level(LogLevel::DEBUG);
    app.use(middleware::static_files("public"));

    app.get("/api/config", [](Response& res) -> Async<void> {
        res.json({{"uuid", generate_uuid()}});
        co_return;
    });

    app.get("/api/projects", [](Response& res) -> Async<void> {
        res.json(Json::array(
            Json({
                {"name", "Blaze Web Framework"},
                {"description", "High-performance C++20 coroutine-powered web engine sustaining 170k+ req/sec."},
                {"stack", "C++20"},
                {"link", "https://github.com/creedpetitt/blaze"}
            }),
            Json({
                {"name", "Hare.io Agent Runtime"},
                {"description", "A local-first, gateway-oriented agent runtime with persistent memory and WebSocket-based streaming."},
                {"stack", "TypeScript, Node.js"},
                {"link", "https://github.com/creedpetitt/hare.io"}
            }),
            Json({
                {"name", "Workflow Orchestrator"},
                {"description", "A distributed workflow engine that decouples state management from polyglot task execution via Kafka and Redis."},
                {"stack", "Java, Spring Boot, Kafka, Redis"},
                {"link", "https://github.com/creedpetitt/workflow-orchestrator"}
            }),
            Json({
                {"name", "6502 Emulator"},
                {"description", "Full-instruction set MOS 6502 CPU emulator with an interactive debugger and memory inspector."},
                {"stack", "Rust"},
                {"link", "https://github.com/creedpetitt/r6502_emu"}
            }),
            Json({
                {"name", "CIPR Shell"},
                {"description", "A custom scripting language and interpreter built from scratch with a focus on memory safety and networking."},
                {"stack", "C++"},
                {"link", "https://github.com/creedpetitt/cipr-shell"}
            })
        ));
        co_return;
    });

    app.listen(8080);
    return 0;
}
