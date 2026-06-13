package com.pos.controller;

import com.pos.dto.ProductDTO;
import com.pos.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO productDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(productDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductDTO> getProductByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(productService.getProductByBarcode(barcode));
    }

    /**
     * GET /api/products
     *   - ?page=0&size=10&sort=name  → returns Page<ProductDTO>
     *   - ?keyword=xxx               → search & return Page<ProductDTO>
     *   - (no page param)            → returns plain List<ProductDTO>
     */
    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false, defaultValue = "name") String sort) {

        // If pagination is requested, return Page<ProductDTO>
        if (page != null) {
            List<ProductDTO> all;
            if (keyword != null && !keyword.isBlank()) {
                all = productService.searchByNameOrCategory(keyword);
            } else if (name != null && !name.isBlank()) {
                all = productService.searchByName(name);
            } else if (category != null && !category.isBlank()) {
                all = productService.searchByCategory(category);
            } else {
                all = productService.getAllProducts();
            }
            // Manual pagination over the list
            int fromIndex = Math.min(page * size, all.size());
            int toIndex   = Math.min(fromIndex + size, all.size());
            List<ProductDTO> pageContent = all.subList(fromIndex, toIndex);
            Page<ProductDTO> pageResult = new PageImpl<>(pageContent,
                    PageRequest.of(page, size, Sort.by(sort)), all.size());
            return ResponseEntity.ok(pageResult);
        }

        // No pagination — simple list (used by POS barcode scanner etc.)
        if (keyword != null && !keyword.isBlank()) {
            return ResponseEntity.ok(productService.searchByNameOrCategory(keyword));
        } else if (name != null && !name.isBlank()) {
            return ResponseEntity.ok(productService.searchByName(name));
        } else if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(productService.searchByCategory(category));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    /** GET /api/products/search?q=keyword  (used by POS quick-search) */
    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(
            @RequestParam(name = "q", required = false, defaultValue = "") String query) {
        if (query.isBlank()) {
            return ResponseEntity.ok(productService.getAllProducts());
        }
        return ResponseEntity.ok(productService.searchByNameOrCategory(query));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.updateProduct(id, productDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
