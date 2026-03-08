"""Simple in-memory caching for API responses."""
from cachetools import TTLCache
from typing import Any, Callable
import hashlib
import json
import logging

logger = logging.getLogger(__name__)

# Global cache instance
_cache: TTLCache[str, Any] = TTLCache(maxsize=1000, ttl=300)


def get_cache_key(*args: Any, **kwargs: Any) -> str:
    """Generate a cache key from function arguments."""
    key_data = {
        "args": args,
        "kwargs": kwargs
    }
    key_str = json.dumps(key_data, sort_keys=True, default=str)
    return hashlib.sha256(key_str.encode()).hexdigest()


def cached(ttl: int = 300):
    """
    Decorator to cache function results.
    
    Args:
        ttl: Time to live in seconds
    """
    def decorator(func: Callable) -> Callable:
        func_cache = TTLCache(maxsize=500, ttl=ttl)
        
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            cache_key = get_cache_key(*args, **kwargs)
            
            if cache_key in func_cache:
                logger.debug(f"Cache hit for {func.__name__}")
                return func_cache[cache_key]
            
            logger.debug(f"Cache miss for {func.__name__}, computing...")
            result = await func(*args, **kwargs)
            func_cache[cache_key] = result
            return result
        
        return wrapper
    return decorator


def clear_cache() -> None:
    """Clear all cached data."""
    _cache.clear()
    logger.info("Cache cleared")

