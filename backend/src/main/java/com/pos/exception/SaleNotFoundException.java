package com.pos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SaleNotFoundException extends RuntimeException {
    public SaleNotFoundException(Long id) {
        super("Sale not found with ID: " + id);
    }
}
