package com.pos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateBarcodeException extends RuntimeException {
    public DuplicateBarcodeException(String barcode) {
        super("A product with barcode '" + barcode + "' already exists.");
    }
}
