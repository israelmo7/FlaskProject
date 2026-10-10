import logging
import random
import string

logger = logging.getLogger(__name__)


def rand_str(length):
    return ''.join(random.choices(string.ascii_letters, k=length))


def fdebug(name, var, sendfrom=''):
    length = 0
    if var is not None and not isinstance(var, int):
        length = len(var)
    logger.debug("[%s]>>%s = %s | %s | (%s)", sendfrom, name, var, type(var), length)
