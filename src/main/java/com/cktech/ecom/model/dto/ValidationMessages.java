package com.cktech.ecom.model.dto;



import com.cktech.ecom.model.reports.ResponseDTO;

import java.util.ArrayList;

/**
 * The type Validation messages.
 */
public class ValidationMessages {

     public static final ResponseDTO INVALID_MESSAGE = new ResponseDTO("INVALID", "Invalid Successfully", new ArrayList<>());
    public static final ResponseDTO UNABLE_TO_SEND_NOTIFY = new ResponseDTO("INVALID", "Unable to send notification!!!", new ArrayList<>());
    public static final ResponseDTO DELETE_MESSAGE = new ResponseDTO("SUCCESS", "Deleted Successfully", new ArrayList<>());
    public static final ResponseDTO SUCCESS_MESSAGE = new ResponseDTO("SUCCESS", "Saved Successfully", new ArrayList<>());
    public static final ResponseDTO SAVE_MESSAGE = new ResponseDTO("SUCCESS", "Saved Successfully", new ArrayList<>());
    public static final ResponseDTO ERROR_MESSAGE = new ResponseDTO("ERROR", "Error Successfully", new ArrayList<>());

    /**
     * Success message response dto.
     * @return the response dto
     */
    public static ResponseDTO successMessage() {
        return SUCCESS_MESSAGE;
    }

    /**
     * Save message response dto.
     * @return the response dto
     */
    public static ResponseDTO saveMessage() {
        return SAVE_MESSAGE;
    }

    /**
     * Delete message response dto.
     * @return the response dto
     */
    public static ResponseDTO deleteMessage() {
        return DELETE_MESSAGE;
    }
    /**
     * Delete message response dto.
     * @return the response dto
     */
    public static ResponseDTO errorMessage() {
        return ERROR_MESSAGE;
    }

}
