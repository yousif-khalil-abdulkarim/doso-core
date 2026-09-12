---
"eridu-tech": patch
---

Exported the `SemaphoreFactoryResolver` class as a runtime value from `eridu-tech/semaphore`. `SemaphoreFactoryResolver` was previously exported as type-only, which prevented it from being instantiated at runtime.
