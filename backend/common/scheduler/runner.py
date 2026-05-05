import logging
from common.scheduler.registry import REGISTERED_TASKS

logger = logging.getLogger(__name__)


def run_all_tasks():
    """
    Instantiates and executes every registered scheduler task.
    Returns a summary of all results.
    """
    logger.info(f"[Scheduler Runner] Running {len(REGISTERED_TASKS)} task(s)...")
    results = []

    for TaskClass in REGISTERED_TASKS:
        task = TaskClass()
        result = task.execute()
        results.append(result)

    success = [r for r in results if r["status"] == "success"]
    failed  = [r for r in results if r["status"] == "failed"]

    logger.info(
        f"[Scheduler Runner] Completed — "
        f"{len(success)} succeeded, {len(failed)} failed."
    )
    return {
        "total":   len(results),
        "success": len(success),
        "failed":  len(failed),
        "results": results,
    }