import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  useOutsideClick,
  Button,
} from "@chakra-ui/react";
import { ChevronDown, Search } from "lucide-react";

// Common drug database
const COMMON_DRUGS = [
  { value: "aspirin", label: "Aspirin (Acetylsalicylic Acid)" },
  { value: "ibuprofen", label: "Ibuprofen (Advil, Motrin)" },
  { value: "paracetamol", label: "Paracetamol (Acetaminophen)" },
  { value: "atorvastatin", label: "Atorvastatin (Lipitor)" },
  { value: "lisinopril", label: "Lisinopril (ACE Inhibitor)" },
  { value: "metformin", label: "Metformin (Diabetes)" },
  { value: "amoxicillin", label: "Amoxicillin (Antibiotic)" },
  { value: "azithromycin", label: "Azithromycin (Zithromax)" },
  { value: "omeprazole", label: "Omeprazole (Gastric)" },
  { value: "ranitidine", label: "Ranitidine (Gastric)" },
  { value: "metoprolol", label: "Metoprolol (Beta Blocker)" },
  { value: "amlodipine", label: "Amlodipine (Calcium Channel Blocker)" },
  { value: "warfarin", label: "Warfarin (Blood Thinner)" },
  { value: "clopidogrel", label: "Clopidogrel (Plavix)" },
  { value: "simvastatin", label: "Simvastatin (Statin)" },
  { value: "losartan", label: "Losartan (ARB)" },
  { value: "hydrochlorothiazide", label: "Hydrochlorothiazide (Diuretic)" },
  { value: "furosemide", label: "Furosemide (Lasix)" },
  { value: "spironolactone", label: "Spironolactone (Potassium Sparer)" },
  { value: "glipizide", label: "Glipizide (Diabetes)" },
  { value: "insulin", label: "Insulin" },
  { value: "levothyroxine", label: "Levothyroxine (Thyroid)" },
  { value: "prednisone", label: "Prednisone (Corticosteroid)" },
  { value: "fluoxetine", label: "Fluoxetine (Prozac)" },
  { value: "sertraline", label: "Sertraline (Zoloft)" },
  { value: "amitriptyline", label: "Amitriptyline (Tricyclic)" },
  { value: "diazepam", label: "Diazepam (Valium)" },
  { value: "ciprofloxacin", label: "Ciprofloxacin (Fluoroquinolone)" },
  { value: "doxycycline", label: "Doxycycline (Tetracycline)" },
  { value: "clarithromycin", label: "Clarithromycin (Macrolide)" },
  { value: "ketoconazole", label: "Ketoconazole (Antifungal)" },
  { value: "fluconazole", label: "Fluconazole (Antifungal)" },
  { value: "metronidazole", label: "Metronidazole (Antibiotic)" },
  { value: "trimethoprim", label: "Trimethoprim-Sulfamethoxazole" },
  { value: "phenytoin", label: "Phenytoin (Dilantin)" },
  { value: "carbamazepine", label: "Carbamazepine (Tegretol)" },
  { value: "valproate", label: "Valproate (Depakote)" },
  { value: "lithium", label: "Lithium Carbonate" },
];

const DrugMultiSelect = ({ onSelectDrug, isSingleSelect = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDrugs, setFilteredDrugs] = useState(COMMON_DRUGS);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const bg = useColorModeValue("white", "gray.700");
  const hoverBg = useColorModeValue("blue.50", "gray.600");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = COMMON_DRUGS.filter(
        (drug) =>
          drug.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drug.value.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredDrugs(filtered);
    } else {
      setFilteredDrugs(COMMON_DRUGS);
    }
  }, [searchTerm]);

  const handleSelectDrug = (drugOption) => {
    const drug = {
      id: drugOption.value,
      name: drugOption.label,
      dosage: undefined,
      frequency: undefined,
    };
    onSelectDrug(drug);

    if (!isSingleSelect) {
      setSearchTerm("");
      if (inputRef.current) inputRef.current.focus();
    } else {
      setIsOpen(false);
      setSearchTerm(drugOption.label);
    }
  };

  return (
    <Box position="relative" flex="1" ref={containerRef}>
      <Box
        position="relative"
        borderWidth="1px"
        borderColor={isOpen ? "blue.500" : borderColor}
        borderRadius="lg"
        bg={bg}
        cursor="pointer"
        onClick={() => setIsOpen(!isOpen)}
        transition="all 0.2s"
      >
        <HStack spacing={2} p={3}>
          <Icon as={Search} color="gray.500" />
          <Input
            ref={inputRef}
            placeholder={
              isSingleSelect ? "Search drug..." : "Add medications..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            border="none"
            _focus={{ outline: "none" }}
            fontSize="sm"
          />
          <Icon as={ChevronDown} color="gray.500" />
        </HStack>
      </Box>

      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          zIndex={10}
          bg={bg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="lg"
          maxH="300px"
          overflowY="auto"
        >
          <VStack align="stretch" spacing={0}>
            {filteredDrugs.length > 0 ? (
              filteredDrugs.map((drug) => (
                <Button
                  key={drug.value}
                  variant="ghost"
                  justifyContent="flex-start"
                  borderRadius={0}
                  px={4}
                  py={3}
                  fontSize="sm"
                  _hover={{ bg: hoverBg }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDrug(drug);
                  }}
                >
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="500">{drug.label}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {drug.value}
                    </Text>
                  </VStack>
                </Button>
              ))
            ) : (
              <Box p={4} textAlign="center" color="gray.500">
                <Text fontSize="sm">No drugs found</Text>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default DrugMultiSelect;
