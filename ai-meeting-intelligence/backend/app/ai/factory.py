from app.config import settings
from app.ai.base import BaseAIProvider
from app.ai.local_mock_provider import LocalMockAIProvider
from app.ai.gemini_provider import GeminiAIProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.anthropic_provider import AnthropicProvider

def get_ai_provider() -> BaseAIProvider:
    provider = settings.AI_PROVIDER.lower()
    if provider == "gemini":
        return GeminiAIProvider()
    elif provider == "openai":
        return OpenAIProvider()
    elif provider == "anthropic":
        return AnthropicProvider()
    return LocalMockAIProvider()
