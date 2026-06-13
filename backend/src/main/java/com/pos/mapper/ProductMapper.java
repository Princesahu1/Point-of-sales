package com.pos.mapper;

import com.pos.dto.ProductDTO;
import com.pos.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductDTO toDTO(Product product);

    Product toEntity(ProductDTO productDTO);

    List<ProductDTO> toDTOList(List<Product> products);

    void updateEntityFromDTO(ProductDTO productDTO, @MappingTarget Product product);
}
