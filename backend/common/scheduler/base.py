from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)


class BaseScheduler(ABC):
    """
    Every scheduler task must extend this.
    Just implement:
      - name       → unique string identifier
      - description → what this task does
      - run()      → actual logic
    """

    name: str = ""
    description: str = ""

    def execute(self):
        """Called by runner. Wraps run() with logging + error handling."""
        logger.info(f"[Scheduler] Starting: {self.name} — {self.description}")
        try:
            result = self.run()
            logger.info(f"[Scheduler] Done: {self.name} → {result}")
            return {"task": self.name, "status": "success", "result": result}
        except Exception as e:
            logger.error(f"[Scheduler] Failed: {self.name} → {str(e)}", exc_info=True)
            return {"task": self.name, "status": "failed", "error": str(e)}

    @abstractmethod
    def run(self) -> dict:
        """
        Put your logic here.
        Return a dict with what happened e.g:
        {"expired": 3, "notified": 3}
        """
        pass