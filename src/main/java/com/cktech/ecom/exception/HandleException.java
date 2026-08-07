package com.cktech.ecom.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HandleException extends Exception {
    /** log. */
    private static final Logger LOG = LoggerFactory.getLogger(HandleException.class);

    /**
     * This method is used to handle exception
     * @param e
     */
    public HandleException(Exception e) {
        LOG.error("Error", e);
    }

    /**
     * This method is used to handle exception
     * @param className, exception
     */
    public HandleException(Class className, Exception e) {
        LOG.error(className + ": ", e);
    }

    public HandleException(String name) {
    }
}
