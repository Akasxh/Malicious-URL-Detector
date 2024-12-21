import requests

url = "https://www.99acres.com/?nn_source=Brand&nn_subsource=DBC&nn_mplatform=HT&nn_category=Res-Buy&nn_msupercity=Pan%20India&nn_landingpage=HP&nn_adtheme=Tagline&nn_mtargeting=InMarket&nn_campaign=Brand_DBC_HT_Res-Buy_Pan%20India_Pan%20India_InMarket_HP_Category_Tagline&nn_medium=Brand_DBC_HT_Res-Buy_Pan%20India_Pan%20India_InMarket_HP_Category_Tagline&utm_source=Brand&utm_campaign=Brand_DBC_HT_Res-Buy_Pan%20India_Pan%20India_InMarket_HP_Category_Tagline&utm_medium=Brand_DBC_HT_Res-Buy_Pan%20India_Pan%20India_InMarket_HP_Category&utm_content=Tagline_30-50_Static&nn_account=HT&nn_creative_supercity=Pan%20India&nn_creative_theme=Tagline&nn_creative_category=InMarket"
response = requests.post("http://localhost:5000/predict", json={"url": url})
print(response.json())
