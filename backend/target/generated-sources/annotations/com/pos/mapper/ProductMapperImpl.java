package com.pos.mapper;

import com.pos.dto.ProductDTO;
import com.pos.model.Product;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-13T19:15:06+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductDTO toDTO(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductDTO.ProductDTOBuilder productDTO = ProductDTO.builder();

        productDTO.barcode( product.getBarcode() );
        productDTO.category( product.getCategory() );
        productDTO.createdAt( product.getCreatedAt() );
        productDTO.id( product.getId() );
        productDTO.name( product.getName() );
        productDTO.price( product.getPrice() );
        productDTO.taxRate( product.getTaxRate() );
        productDTO.updatedAt( product.getUpdatedAt() );

        return productDTO.build();
    }

    @Override
    public Product toEntity(ProductDTO productDTO) {
        if ( productDTO == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.barcode( productDTO.getBarcode() );
        product.category( productDTO.getCategory() );
        product.createdAt( productDTO.getCreatedAt() );
        product.id( productDTO.getId() );
        product.name( productDTO.getName() );
        product.price( productDTO.getPrice() );
        product.taxRate( productDTO.getTaxRate() );
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

        product.setBarcode( productDTO.getBarcode() );
        product.setCategory( productDTO.getCategory() );
        product.setCreatedAt( productDTO.getCreatedAt() );
        product.setId( productDTO.getId() );
        product.setName( productDTO.getName() );
        product.setPrice( productDTO.getPrice() );
        product.setTaxRate( productDTO.getTaxRate() );
        product.setUpdatedAt( productDTO.getUpdatedAt() );
    }
}
