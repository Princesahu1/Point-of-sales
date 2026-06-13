package com.pos.mapper;

import com.pos.dto.ProductDTO;
import com.pos.model.Product;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-13T17:39:06+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Eclipse Adoptium)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductDTO toDTO(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductDTO.ProductDTOBuilder productDTO = ProductDTO.builder();

        productDTO.id( product.getId() );
        productDTO.name( product.getName() );
        productDTO.barcode( product.getBarcode() );
        productDTO.category( product.getCategory() );
        productDTO.price( product.getPrice() );
        productDTO.taxRate( product.getTaxRate() );
        productDTO.createdAt( product.getCreatedAt() );
        productDTO.updatedAt( product.getUpdatedAt() );

        return productDTO.build();
    }

    @Override
    public Product toEntity(ProductDTO productDTO) {
        if ( productDTO == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.id( productDTO.getId() );
        product.name( productDTO.getName() );
        product.barcode( productDTO.getBarcode() );
        product.category( productDTO.getCategory() );
        product.price( productDTO.getPrice() );
        product.taxRate( productDTO.getTaxRate() );
        product.createdAt( productDTO.getCreatedAt() );
        product.updatedAt( productDTO.getUpdatedAt() );

        return product.build();
    }

    @Override
    public List<ProductDTO> toDTOList(List<Product> products) {
        if ( products == null ) {
            return null;
        }

        List<ProductDTO> list = new ArrayList<ProductDTO>( products.size() );
        for ( Product product : products ) {
            list.add( toDTO( product ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromDTO(ProductDTO productDTO, Product product) {
        if ( productDTO == null ) {
            return;
        }

        product.setId( productDTO.getId() );
        product.setName( productDTO.getName() );
        product.setBarcode( productDTO.getBarcode() );
        product.setCategory( productDTO.getCategory() );
        product.setPrice( productDTO.getPrice() );
        product.setTaxRate( productDTO.getTaxRate() );
        product.setCreatedAt( productDTO.getCreatedAt() );
        product.setUpdatedAt( productDTO.getUpdatedAt() );
    }
}
