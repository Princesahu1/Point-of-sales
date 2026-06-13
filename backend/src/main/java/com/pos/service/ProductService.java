package com.pos.service;

import com.pos.dto.ProductDTO;

import java.util.List;

public interface ProductService {

    ProductDTO createProduct(ProductDTO productDTO);

    ProductDTO getProductById(Long id);

    ProductDTO getProductByBarcode(String barcode);

    List<ProductDTO> getAllProducts();

    List<ProductDTO> searchByName(String name);

    List<ProductDTO> searchByCategory(String category);

    List<ProductDTO> searchByNameOrCategory(String keyword);

    ProductDTO updateProduct(Long id, ProductDTO productDTO);

    void deleteProduct(Long id);
}
