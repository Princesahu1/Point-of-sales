package com.pos.serviceImpl;

import com.pos.dto.ProductDTO;
import com.pos.exception.DuplicateBarcodeException;
import com.pos.exception.ProductNotFoundException;
import com.pos.mapper.ProductMapper;
import com.pos.model.Product;
import com.pos.repository.ProductRepository;
import com.pos.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        if (productRepository.existsByBarcode(productDTO.getBarcode())) {
            throw new DuplicateBarcodeException(productDTO.getBarcode());
        }
        Product product = productMapper.toEntity(productDTO);
        Product saved = productRepository.save(product);
        return productMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return productMapper.toDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with barcode: " + barcode));
        return productMapper.toDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productMapper.toDTOList(productRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> searchByName(String name) {
        return productMapper.toDTOList(productRepository.findByNameContainingIgnoreCase(name));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> searchByCategory(String category) {
        return productMapper.toDTOList(productRepository.findByCategoryIgnoreCase(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> searchByNameOrCategory(String keyword) {
        return productMapper.toDTOList(
                productRepository.findByNameContainingIgnoreCaseOrCategoryIgnoreCase(keyword, keyword));
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        // Check barcode uniqueness if changed
        if (!product.getBarcode().equals(productDTO.getBarcode())
                && productRepository.existsByBarcode(productDTO.getBarcode())) {
            throw new DuplicateBarcodeException(productDTO.getBarcode());
        }

        productMapper.updateEntityFromDTO(productDTO, product);
        Product updated = productRepository.save(product);
        return productMapper.toDTO(updated);
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
    }
}
