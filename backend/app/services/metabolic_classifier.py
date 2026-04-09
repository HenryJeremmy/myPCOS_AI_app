from dataclasses import dataclass


@dataclass(frozen=True)
class FoodMetabolicProfile:
    glycaemic_band: str
    metabolic_tag: str
    rationale: str


FOOD_LOOKUP: dict[str, FoodMetabolicProfile] = {
    "Rice": FoodMetabolicProfile(
        glycaemic_band="high",
        metabolic_tag="refined_carb",
        rationale="Typically rice-based meals are rapidly digestible carbohydrate sources.",
    ),
    "Fried rice": FoodMetabolicProfile(
        glycaemic_band="high",
        metabolic_tag="mixed_refined_meal",
        rationale="Usually combines refined rice with oils and mixed additions.",
    ),
    "Pizza toast": FoodMetabolicProfile(
        glycaemic_band="moderate",
        metabolic_tag="mixed_refined_meal",
        rationale="Often combines bread-based carbohydrate with fat and protein toppings.",
    ),
    "Spaghetti": FoodMetabolicProfile(
        glycaemic_band="moderate",
        metabolic_tag="refined_carb",
        rationale="Pasta is carbohydrate-dense but may digest more slowly than some refined grains.",
    ),
    "Hamburger": FoodMetabolicProfile(
        glycaemic_band="moderate",
        metabolic_tag="mixed_high_energy",
        rationale="A mixed meal with refined bun, fat, and protein rather than a pure carbohydrate source.",
    ),
    "Pizza": FoodMetabolicProfile(
        glycaemic_band="moderate",
        metabolic_tag="mixed_high_energy",
        rationale="Usually a mixed refined-carbohydrate meal with added fat and protein.",
    ),
    "Toast": FoodMetabolicProfile(
        glycaemic_band="high",
        metabolic_tag="refined_carb",
        rationale="Toast is usually bread-based and commonly acts as a fast-digesting carbohydrate source.",
    ),
    "Croissant": FoodMetabolicProfile(
        glycaemic_band="moderate",
        metabolic_tag="refined_pastry",
        rationale="Croissants are refined flour pastries with added fat, making them energy dense mixed foods.",
    ),
    "Roll bread": FoodMetabolicProfile(
        glycaemic_band="high",
        metabolic_tag="refined_carb",
        rationale="Bread rolls are usually refined carbohydrate foods with relatively high glycaemic impact.",
    ),
    "Sandwiches": FoodMetabolicProfile(
        glycaemic_band="moderate",
        metabolic_tag="mixed_refined_meal",
        rationale="Sandwiches are commonly mixed meals built on refined bread with variable protein and fat fillings.",
    ),
    "Sushi": FoodMetabolicProfile(
        glycaemic_band="moderate",
        metabolic_tag="mixed_carb_protein",
        rationale="Often combines white rice with fish or other protein sources.",
    ),
    "French fries": FoodMetabolicProfile(
        glycaemic_band="high",
        metabolic_tag="starchy_fried_carb",
        rationale="Potato-based fried foods are typically high glycaemic and energy dense.",
    ),
    "Green salad": FoodMetabolicProfile(
        glycaemic_band="low",
        metabolic_tag="vegetable_forward",
        rationale="Non-starchy vegetable meals are usually lower glycaemic.",
    ),
    "Sausage": FoodMetabolicProfile(
        glycaemic_band="moderate",
        metabolic_tag="processed_protein_fat",
        rationale="Sausages are processed protein-fat foods with low direct carbohydrate but higher metabolic processing concern.",
    ),
    "Omelet": FoodMetabolicProfile(
        glycaemic_band="low",
        metabolic_tag="protein_rich",
        rationale="Egg-based meals are generally low in carbohydrate and primarily protein-fat based.",
    ),
    "Fried chicken": FoodMetabolicProfile(
        glycaemic_band="moderate",
        metabolic_tag="fried_protein",
        rationale="Fried chicken is usually a protein-rich food with added batter and fat from frying.",
    ),
    "Boiled fish": FoodMetabolicProfile(
        glycaemic_band="low",
        metabolic_tag="lean_protein",
        rationale="Boiled fish is typically low in carbohydrate and mainly protein based.",
    ),
    "Beef steak": FoodMetabolicProfile(
        glycaemic_band="low",
        metabolic_tag="protein_rich",
        rationale="Beef steak is mainly protein and fat with minimal direct glycaemic effect.",
    ),
    "Hot dog": FoodMetabolicProfile(
        glycaemic_band="moderate",
        metabolic_tag="processed_mixed_meal",
        rationale="Hot dogs are processed mixed foods, often eaten with refined bread and condiments.",
    ),
}


def _normalise_food_label(food: str) -> str:
    return " ".join(food.strip().lower().split())


NORMALISED_FOOD_LOOKUP: dict[str, FoodMetabolicProfile] = {
    _normalise_food_label(label): profile for label, profile in FOOD_LOOKUP.items()
}


def _normalise_foods(foods_text: str) -> list[str]:
    return [item.strip() for item in foods_text.split(",") if item.strip()]


def classify_meal(foods_text: str) -> dict[str, str]:
    foods = _normalise_foods(foods_text)
    if not foods:
        return {
            "glycaemic_band": "unknown",
            "metabolic_summary": "No confirmed foods available for metabolic classification.",
        }

    profiles = [
        NORMALISED_FOOD_LOOKUP.get(_normalise_food_label(food)) for food in foods
    ]
    known_profiles = [profile for profile in profiles if profile is not None]

    if not known_profiles:
        return {
            "glycaemic_band": "unknown",
            "metabolic_summary": "No matching metabolic profile was available for the confirmed foods.",
        }

    if any(profile.glycaemic_band == "high" for profile in known_profiles):
        glycaemic_band = "high"
    elif any(profile.glycaemic_band == "moderate" for profile in known_profiles):
        glycaemic_band = "moderate"
    else:
        glycaemic_band = "low"

    metabolic_tags = ", ".join(sorted({profile.metabolic_tag for profile in known_profiles}))
    rationale = " ".join(profile.rationale for profile in known_profiles[:2])

    return {
        "glycaemic_band": glycaemic_band,
        "metabolic_summary": (
            f"Tagged as {glycaemic_band} glycaemic impact. "
            f"Metabolic profile: {metabolic_tags}. {rationale}"
        ),
    }
