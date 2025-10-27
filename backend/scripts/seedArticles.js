// backend/scripts/seedAllArticles.js
const mongoose = require('mongoose');
require('dotenv').config();

const Article = require('../models/Article');

const articlesData = {
  "categories": [
    "Health",
    "Education",
    "Finances",
    "Routines",
    "Parenting",
    "Saved"
  ],
  "articles": [
    {
      "id": 1,
      "title": "Canada Invests $30 Million in Youth Mental Health Services Nationwide",
      "category": "Health",
      "image": "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&h=500&fit=crop&q=80",
      "description": "The Canadian government has announced over $30 million in funding to strengthen integrated youth mental health services across all provinces and territories, addressing unprecedented challenges faced by young Canadians.",
      "content": "Young Canadians are facing unprecedented mental health challenges, with services often being fragmented and difficult to access. In September 2025, the Government of Canada announced an investment of more than $30 million over four years to strengthen and expand the Integrated Youth Services Network across the country. This funding will advance research and data sharing within 12 provincial and territorial networks and a pan-Canadian Indigenous network to identify which supports work best for young people aged 12 to 25. The initiative aims to provide youth with a single, accessible place to find help with mental health, substance use, physical health, housing, and peer support services. Networks in provinces like Alberta are developing youth-led research hubs, while Quebec is strengthening its learning health system to make services faster and more accessible. Indigenous communities will lead research to develop culturally grounded services rooted in their traditions. This investment represents a major step toward building a pan-Canadian Learning Health System where data and real-world experiences continuously improve care for Canada's youth.",
      "author": "Health Canada",
      "saved": false,
      "isFeatured": true,
      "link": "https://www.canada.ca/en/institutes-health-research/news/2025/09/government-of-canada-invests-in-research-to-inform-better-youth-mental-health-and-wellness-services-across-the-country.html"
    },
    {
      "id": 2,
      "title": "New Smoking Cessation Guidelines Released for Canadian Adults",
      "category": "Health",
      "image": "https://images.unsplash.com/photo-1628527304948-06157ee3c8a6?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=500&fit=crop&q=80",
      "description": "The Canadian Task Force on Preventive Health Care has released Canada's first comprehensive smoking cessation guideline, providing evidence-based recommendations for adults looking to quit tobacco.",
      "content": "In August 2025, Canada released its first national smoking cessation guideline for adults, offering healthcare providers and patients evidence-based recommendations on effective quitting methods. Tobacco smoking remains the leading cause of preventable disease and death in Canada, with 11% of Canadians aged 15 and older currently smoking. The new guideline strongly recommends that all people who smoke be encouraged to stop and offered one or more cessation interventions, including behavioural counselling, pharmacotherapy options like nicotine replacement therapy (NRT), varenicline, bupropion, and cytisine, or combined approaches. The guideline uses the GRADE methodology and reviewed 22 Cochrane systematic reviews on smoking cessation interventions. While e-cigarettes are conditionally not suggested for most individuals due to uncertainties about long-term safety, they may be an option for those who have tried other methods unsuccessfully. In March 2025, the government also announced nearly $12 million in funding for eight community-based smoking cessation projects across Canada and established a Tobacco Cost Recovery Framework to shift costs from taxpayers to tobacco companies. Smoking cessation can reduce the risk of cardiovascular disease events by 50% within one year of quitting.",
      "author": "Canadian Task Force on Preventive Health Care",
      "saved": false,
      "isFeatured": true,
      "link": "https://canadiantaskforce.ca/guidelines/published-guidelines/tobacco-smoking-in-adults/"
    },
    {
      "id": 3,
      "title": "Canada's Food Guide: Promoting Healthy Eating and Sustainability",
      "category": "Health",
      "image": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop&q=80",
      "description": "Health Canada's revised Food Guide emphasizes plant-based eating, mindful consumption, and cultural food traditions while promoting both personal and environmental health.",
      "content": "Canada's Food Guide, revised in 2019 and continuing to guide nutritional policy through 2025, represents a significant evolution in how Canadians approach healthy eating. The guide shifts from specific portion sizes to proportions, recommending that half of each plate consist of vegetables and fruits, one-quarter whole grains, and one-quarter protein foods, with water as the beverage of choice. The guide emphasizes choosing plant-based protein sources like beans, lentils, and nuts more often, which benefits both personal health and the environment. Beyond just food choices, the guide promotes mindful eating habits including cooking at home more often, planning meals, being aware of hunger and fullness cues, and enjoying meals with others. Health Canada developed the guide using evidence from multiple systematic reviews while excluding industry-commissioned reports to avoid conflicts of interest. The approach aligns with concepts of planetary health by emphasizing environmentally sustainable food choices. The guide has been widely integrated into Canadian health policies and programs, endorsed by over 65 national organizations and all provincial governments. In March 2025, Statistics Canada reported that while food insecurity remains a challenge, with 16.9% of Canadians experiencing moderate or severe food insecurity in 2022, the Food Guide continues to provide accessible guidance for making nutritious choices.",
      "author": "Health Canada",
      "saved": false,
      "isFeatured": false,
      "link": "https://food-guide.canada.ca/en/"
    },
    {
      "id": 4,
      "title": "Physical Activity Guidelines: Moving More for Better Health",
      "category": "Health",
      "image": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=500&fit=crop&q=80",
      "description": "Canadian adults are encouraged to achieve at least 150 minutes of moderate-to-vigorous physical activity weekly, with new postpartum guidelines released in 2025 to support women's health.",
      "content": "Physical activity remains a cornerstone of health promotion in Canada, with the Canadian 24-Hour Movement Guidelines recommending adults aged 18-64 engage in at least 150 minutes of moderate-to-vigorous aerobic activity per week, along with muscle-strengthening activities at least twice weekly. However, only 53% of men and 46% of women in Canada meet the guideline of at least 7,500 steps per day, and adults are sedentary for an average of 9.6 hours daily excluding sleep time. In 2025, Canada became a 'super-aged' country with at least 20% of the population aged 65 and older, making physical activity promotion even more critical. A landmark Canadian guideline released in March 2025 provides the first national recommendations for physical activity, sedentary behaviour, and sleep during the first year postpartum. The guideline, developed over three years by a pan-Canadian panel reviewing over 19,000 research articles, recommends postpartum individuals progressively build up to 120 minutes of moderate-to-vigorous activity per week, including aerobic and strength-training exercises. Research shows increased physical activity can reduce postpartum depression risk by 45%, urinary incontinence by 37%, and type 2 diabetes by 28%. Physical inactivity costs Canada an estimated $3.9 billion annually in direct and indirect healthcare costs, with getting just 10% more Canadians active potentially saving $629 million in chronic disease costs.",
      "author": "Canadian Society for Exercise Physiology",
      "saved": false,
      "isFeatured": false,
      "link": "https://csepguidelines.ca/"
    },
    {
      "id": 5,
      "title": "Healthcare Trends 2025: Addressing Inequities and Mental Health Crisis",
      "category": "Health",
      "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=500&fit=crop&q=80",
      "description": "As Canada faces federal elections and healthcare system pressures, experts identify key trends including mental health crisis management, healthcare equity, and workforce challenges requiring urgent attention.",
      "content": "Canada's healthcare system faces critical challenges in 2025, with federal elections bringing healthcare policy into sharp focus despite economic concerns dominating headlines. Three-quarters of Canadians believe limited healthcare access directly threatens their health, reflecting frustration with a system experiencing significant strain. Mental health remains a particular crisis, with rates three times worse than pre-pandemic levels according to the Canadian Mental Health Association, and 21.2% of employed Canadians reporting high work-related stress. Economic uncertainty compounds these issues, as financial well-being and mental health are deeply interconnected. Healthcare inequities persist across racial, geographic, and income lines, with Indigenous communities facing heart disease rates up to 50% higher than the general Canadian population and stroke death rates twice as high. One in five Canadians lacks access to a regular primary care doctor, jeopardizing timely diagnosis and management of chronic conditions, while nurses continue leaving public healthcare due to overwhelming workloads and inadequate mental health support. Canada needs substantial expansion of its healthcare workforce and full implementation of national pharmacare and dental plans. The Canadian Dental Care Plan has already benefited 1.5 million Canadians, while the government invested nearly $200 billion in a 10-year healthcare funding plan. However, Canada's federally-funded but provincially-administered healthcare model creates variations in coverage and access that require better interjurisdictional cooperation to address systemic issues effectively.",
      "author": "Environics Analytics",
      "saved": false,
      "isFeatured": true,
      "link": "https://environics.ca/insights/articles/healthcare-trends-canada-2025/"
    },
    {
      "id": 6,
      "title": "Canada Learning Bond: Automatic Enrollment to Benefit 130,000 Children Annually",
      "category": "Education",
      "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=500&fit=crop&q=80",
      "description": "The Government of Canada introduces automatic enrollment for the Canada Learning Bond, removing barriers to post-secondary education savings for low-income families.",
      "content": "In February 2025, the Canadian government announced a groundbreaking change to the Canada Learning Bond (CLB) program that will automatically enroll eligible children, removing complex barriers that have prevented many families from accessing up to $2,000 in education savings. For 20 years, the CLB has helped students from low-income families pursue post-secondary education through Registered Education Savings Plans (RESPs), but many eligible families missed out simply because they didn't know the benefit existed or found the application process too complicated. Starting in 2028, an additional 130,000 children will receive the Bond each year through automatic enrollment. Parents of eligible children will receive letters informing them that the government will open an RESP on their child's behalf if they don't already have one by age four. The money can be used for apprenticeship programs, trade schools, colleges, or universities, as well as expenses like rent, tuition, books, tools, or transportation. The Bond is retroactive, meaning eligible adults born in 2004 or later can receive it until the day before they turn 21. In a major expansion announced for April 2028, the age limit will be extended from 20 to 30 years old, allowing young adults to retroactively access the benefit for their post-secondary education. This initiative represents a significant step toward ensuring that every Canadian child has the financial support needed to pursue their educational dreams, regardless of their family's income level.",
      "author": "Employment and Social Development Canada",
      "saved": false,
      "isFeatured": true,
      "link": "https://www.canada.ca/en/employment-social-development/news/2025/02/government-of-canada-making-it-easier-for-canadian-parents-to-plan-for-their-childrens-education.html"
    },
    {
      "id": 7,
      "title": "Alberta's $8.6 Billion School Building Initiative: 90 New Schools by 2028",
      "category": "Education",
      "image": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=500&fit=crop&q=80",
      "description": "Alberta embarks on an ambitious construction project to build 90 new schools within three years to accommodate the province's rapid population growth.",
      "content": "Wild Rose Country welcomed more than 200,000 new residents in 2024, and with them came thousands of children requiring education. To meet this unprecedented demand, Alberta is embarking on an ambitious $8.6 billion initiative to create 90 new schools within the next three years. This massive infrastructure project represents one of the largest educational investments in Canadian provincial history and reflects the urgent need to address classroom overcrowding and ensure quality education for all students. However, the ambitious timeline faces a significant challenge: Alberta's construction sector is experiencing a near-record job vacancy rate of seven percent, creating a labor shortage that threatens not only school construction but also roads, housing, and other critical infrastructure projects. The province is also implementing the 'balanced calendar model' in several schools, which aims to reduce summer learning losses and prevent student burnout throughout the year by redistributing breaks more evenly. This rotating-cohort setup is being proposed as a solution for classroom overcrowding in British Columbia as well. Alberta's investment underscores the critical importance of adapting educational infrastructure to meet population demands while maintaining high standards of learning environments. The success of this initiative will depend on the province's ability to recruit and retain construction workers while coordinating one of the most ambitious school-building programs in Canadian history.",
      "author": "Alberta Education",
      "saved": false,
      "isFeatured": false,
      "link": "https://macleans.ca/the-year-ahead/ten-education-predictions-for-2025/"
    },
    {
      "id": 8,
      "title": "British Columbia Expands Child Care: 640 New Spaces on School Grounds",
      "category": "Education",
      "image": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=500&fit=crop&q=80",
      "description": "BC creates 640 new licensed child care spaces on school grounds across 12 communities, part of a broader $10-a-day childcare initiative.",
      "content": "In August 2025, the governments of Canada and British Columbia announced the creation of 640 new licensed child care spaces on school grounds in 12 communities throughout the province, representing a major step toward accessible, affordable early learning. These spaces are supported by more than $23.5 million in ChildCareBC New Spaces funding, jointly funded by provincial investments and federal support under the Canada-wide Early Learning and Child Care agreement. When the new facilities open, families will benefit from affordable child care fees through the province's fee reduction program, which reduces costs by up to $900 per child per month. By 2025-2026, British Columbia has committed to creating 30,000 new licensed child care spaces for children under age six, and a total of 40,000 new licensed spaces for children aged 0-5 by 2027-2028. The federal and provincial governments recently signed an extension to the agreement for 2026-2031 to continue supporting access to high-quality, affordable, flexible, and inclusive early learning programs. Since 2018, ChildCareBC's space-creation programs have helped fund more than 41,500 new licensed child care spaces in BC, with 26,200 of these already open and providing care for families. As part of the Canada-wide Early Learning and Child Care system, the federal government aims to work with provinces and territories to create approximately 250,000 new child care spaces across Canada by March 2026, giving families access to affordable care that supports workforce participation and child development.",
      "author": "Employment and Social Development Canada",
      "saved": false,
      "isFeatured": true,
      "link": "https://www.canada.ca/en/employment-social-development/news/2025/08/expanding-access-to-child-care-in-british-columbia-schools.html"
    },
    {
      "id": 9,
      "title": "Ontario Updates Curriculum: New Focus on Financial Literacy and Mental Health",
      "category": "Education",
      "image": "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop&q=80",
      "description": "Ontario's Ministry of Education introduces updated curriculum for 2024-2025 including mandatory mental health literacy and enhanced financial education.",
      "content": "Ontario's education system is undergoing significant modernization with new curriculum updates rolled out for the 2024-2025 school year and beyond. In September 2024, students began learning from additional new curricula including a de-streamed Grade 9 Exploring Canadian Geography course, new Grades 9 and 10 Business Studies courses, new Technological Education courses, and a new Grade 9 English course for French-language schools. A critical addition is mandatory learning on mental health literacy, now included in the Grade 10 Career Studies course, recognizing the importance of equipping students with tools to understand and manage their mental wellbeing. The ministry continues to ensure students learn key financial literacy skills through mandatory Grades 9 and 10 financial literacy modules, preparing them for real-world money management. Starting in September 2025, the Kindergarten curriculum will include new mandatory learning focused on early reading, math, and STEM education, ensuring Ontario's youngest learners are well-prepared for academic success. To support inclusivity, curriculum updates for September 2025 include mandatory learning about the Ukrainian Famine-Genocide of 1932-33, the Holocaust, and the history and contributions of Black Canadians in Grade 10 Canadian History. The Grades 7 and 8 History curricula are also being revised to include new mandatory learning about Black Canadians. Under the Canada-wide Early Learning and Child Care system, Ontario is working toward reducing child care fees to an average of $10 a day per child under six by March 2026, with thousands of families already benefiting from fee reductions averaging 50% relative to 2020 levels.",
      "author": "Ontario Ministry of Education",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.ontario.ca/page/published-plans-and-annual-reports-2024-2025-ministry-education"
    },
    {
      "id": 10,
      "title": "Canada's Education System Ranks Second Best Globally in 2025",
      "category": "Education",
      "image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=500&fit=crop&q=80",
      "description": "Canada maintains its position as having one of the world's best education systems, with 58% of working-age adults holding post-secondary degrees.",
      "content": "Canada continues to be internationally recognized for having one of the best education systems in the world, ranking second globally according to a 2023 report. The Canadian government spends 11.1% of total expenditure on education, above the OECD average of 10.6%, and this investment is paying dividends. According to the 2021 Census, approximately 58% of Canada's working-age population (ages 25 to 64) have graduated from either a university or college—the highest proportion in the G7. In 2020, Canada had 14,600 public schools and 436 post-secondary educational facilities, with public and private education expenditure totaling $112.8 billion in 2018-19. Over 45% of post-secondary education funding comes from the government, ensuring accessibility for students across income levels. School in Canada is mandatory from age five or six depending on the province, with 94% of Canadians having earned at least a high school diploma by 2021. Primary education typically starts at grade one when children are six or seven years old and continues through grade eight, while secondary education covers junior high school (grades seven and eight) and high school (grades nine through twelve). The average cost of undergraduate programs was $6,580 in 2021, and the average salary for teachers in Canada is $93,700. Education is free for all children of Canadian citizens and permanent residents from kindergarten through the end of high school, jointly funded through taxes paid by all residents, making quality education accessible regardless of family income.",
      "author": "Statistics Canada",
      "saved": false,
      "isFeatured": false,
      "link": "https://madeinca.ca/education-system-statistics-canada/"
    },
    {
      "id": 11,
      "title": "Best Budgeting Apps for Canadian Families in 2025",
      "category": "Finances",
      "image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop&q=80",
      "description": "Discover the top budgeting and personal finance apps helping Canadian families track spending, manage debt, and build financial literacy in 2025.",
      "content": "Managing money no longer requires spreadsheets or complicated math. In 2025, Canadians have access to a growing ecosystem of budgeting apps designed to track spending, manage debt, and build financial literacy from smartphones and computers. Among the top Canadian-first apps is ElektraFi, designed to help people manage their entire financial life through a single intuitive platform. Lunch Money, built by a solo developer with a global mindset, supports multiple currencies and works with most Canadian financial institutions via Plaid, making it perfect for freelancers and digital nomads. PocketGuard simplifies finances by showing exactly how much is left after bills, goals, and savings, with its 'In My Pocket' feature providing real-time spending availability. For those wanting powerful tools without complexity, Monarch Money offers sleek, collaborative budgeting perfect for partners or families to track budgets, goals, and investments together. KOHO combines a financial app with a prepaid card, offering unique budgeting functionality alongside its payment features. Quicken remains a robust desktop-based tool for users managing complex finances, with features ranging from budgeting to investment tracking and debt payoff calculators. The Budget Planner tool from the Financial Consumer Agency of Canada allows users to create personalized budgets online, providing tips and guidelines while creating charts showing where money is going and comparing budgets with other Canadians in similar situations. While Canadians have fewer app options compared to Americans, the available tools effectively help families balance income with savings and expenses, guiding spending to reach financial goals.",
      "author": "ElektraFi",
      "saved": false,
      "isFeatured": true,
      "link": "https://elektrafi.io/blog/best-budgeting-personal-finance-apps-in-canada-for-2025"
    },
    {
      "id": 12,
      "title": "Creating an Emergency Fund: Canada's Financial Experts Recommend 3-6 Months",
      "category": "Finances",
      "image": "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&h=500&fit=crop&q=80",
      "description": "Financial Consumer Agency of Canada emphasizes the importance of emergency funds covering 3-6 months of living expenses to reduce financial stress.",
      "content": "To deal with unexpected situations, financial experts across Canada recommend creating an emergency fund that provides enough money to cover living expenses for 3 to 6 months. While these amounts can sometimes seem out of reach, the Financial Consumer Agency of Canada advises starting by saving a small amount on a regular basis. Having an emergency fund helps reduce financial stress and avoids getting trapped in a debt cycle when unexpected expenses arise. Making a budget is the critical first step in building this financial safety net. A budget is a plan that helps manage money by figuring out how much money comes in, goes out, and gets saved. Making a budget helps balance income with savings and expenses, guiding spending to reach financial goals. Canadians can use the free Budget Planner tool from the Financial Consumer Agency to create personalized budgets, which provides tips, guidelines, and charts showing where money is going. The tool also allows comparing budgets with other Canadians in similar age, income, housing, and family situations. When creating a budget, it's essential to distinguish between needs and wants. A 'need' is something necessary, required, or essential (like housing, clothing, food, or medication), while a 'want' is something desired but not necessarily needed (like restaurant meals, trips, gym memberships, or designer shoes). Tracking money to figure out what comes in and out is crucial. Many Canadians face financial challenges, with almost 23% reporting some form of food insecurity in 2022. By maintaining an emergency fund and following a realistic budget, families can better weather economic uncertainty and unexpected life events.",
      "author": "Financial Consumer Agency of Canada",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.canada.ca/en/financial-consumer-agency/services/make-budget.html"
    },
    {
      "id": 13,
      "title": "Federal Budget 2025: Carney's Plan for Austerity and Investment",
      "category": "Finances",
      "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop&q=80",
      "description": "Prime Minister Mark Carney's first federal budget promises to balance reduced spending with strategic investments in infrastructure, housing, and Canadian competitiveness.",
      "content": "Canada's Finance Minister François-Philippe Champagne delivered the 2025 Federal Budget on November 4, 2025—Prime Minister Mark Carney's first budget—describing it as an 'ambitious plan for Canadians' amid global economic uncertainty. Carney has characterized Budget 2025 as both 'an austerity and investment budget at the same time,' indicating plans to spend less while investing more in critical areas. The budget follows six weeks of nationwide consultations discussing issues including U.S. tariffs, internal trade and labour mobility, defence, and advancing digital transformation through artificial intelligence. The government is introducing a new Capital Budgeting Framework to distinguish day-to-day operational spending from capital investments, helping prioritize investments generating long-term benefits like major projects, housing, clean energy, and infrastructure. Starting with Budget 2025, the federal budget will be delivered in the fall, followed by an economic and fiscal update in the spring, providing greater predictability for builders, businesses, investors, and municipalities. Carney vowed to double non-U.S. exports over the next decade while boosting domestic investment and infrastructure, and acknowledged the federal government has been spending more than the economy has grown. The budget outlines strategies to reduce operational spending and streamline government services. New apprenticeship and skills-training programs and a 'talent strategy for the next generation of scientists and innovators' are included. The Build Canada Homes initiative aims to double housing construction pace, with additional measures expected to lower costs for builders and attract private capital. Business leaders overwhelmingly support expanding financing options and reorienting programs to help businesses access non-U.S. markets.",
      "author": "Department of Finance Canada",
      "saved": false,
      "isFeatured": true,
      "link": "https://kpmg.com/ca/en/home/insights/2025/09/canadian-federal-budget-2025.html"
    },
    {
      "id": 14,
      "title": "How to Budget During Economic Uncertainty: Expert Tips for Canadian Families",
      "category": "Finances",
      "image": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1609429019995-8c40f49535a5?w=800&h=500&fit=crop&q=80",
      "description": "Canadian money coaches provide practical advice for families navigating mortgage renewals, food insecurity, and economic challenges in 2025.",
      "content": "It's been tough lately for many Canadians, with almost 23% of the country reporting some form of food insecurity in 2022 according to Statistics Canada. Meanwhile, more than 3 million Canadians faced mortgage renewals between January 2024 and June 2025, with payments potentially 30% to 40% higher. The economy continues slowing as the lagged impact of earlier interest rate increases materializes. However, financial experts say this bleak picture shouldn't keep Canadians down—it's essential to continue saving, investing, and empowering ourselves to deal with the rapidly changing economic landscape. 'A lot of people don't know their monthly budget. So, know your stuff. I've got this much and this is the plan. The numbers don't lie, so denial won't work. Look at your numbers,' says Janet Gray, Money Coach with Money Coaches Canada. When starting a budget, write down net income, savings and investments, then consider four key categories: housing, transportation, food, and other expenses. Once regular expenses are identified and compared with income, look at financial goals and create a financial plan knowing where you are and where you're going. The Financial Consumer Agency of Canada offers a free online budget planner tool, and Microsoft provides handy Excel budget templates. To mitigate stress during economic uncertainty, make regular budget reviews less of a chore—perhaps a family activity to identify expense reduction opportunities. Practice healthy routines including exercise, drinking water, and getting plenty of sleep. The correlation between financial health and personal health shouldn't be underestimated, as economic uncertainty can affect both individual and societal wellbeing.",
      "author": "Money Coaches Canada",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.morningstar.ca/ca/news/249010/how-to-budget-in-canada-amid-economic-uncertainty.aspx"
    },
    {
      "id": 15,
      "title": "Teaching Teens Financial Literacy: University Planning and Money Skills",
      "category": "Finances",
      "image": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop&q=80",
      "description": "As university acceptance letters arrive, Canadian parents are encouraged to tackle three critical money topics with their teenagers.",
      "content": "As university acceptance letters arrive in 2025, Canadian parents face an important opportunity to discuss money matters with their teenagers. Ontario high school teachers report that students today are increasingly worried about money and their future, making financial literacy education more critical than ever. The Ontario Ministry of Education recognizes this need, continuing to ensure students learn key financial literacy skills through mandatory Grades 9 and 10 financial literacy modules. Parents are encouraged to tackle three essential money topics with their teenagers: understanding the true cost of post-secondary education including tuition, residence, textbooks, and living expenses; learning about student loans, lines of credit, and the long-term implications of borrowing; and developing practical budgeting skills for managing money independently. Many Canadian families worry they can't afford to leave an inheritance, yet their kids may be banking on one, creating a disconnect that needs open communication. The reality is that parents need to ensure their own financial security first, including having adequate life insurance, before worrying about leaving inheritances. With the average cost of undergraduate programs at $6,580 in 2021, and 58% of Canada's working-age population holding post-secondary degrees, investing in education remains crucial. However, teaching teenagers to understand the financial commitment and develop money management skills is equally important. Remote work has provided some parents with greater financial flexibility, as time saved on commuting translates into money saved and more family time. Parents should use this period to model healthy financial behaviors and have honest conversations about money to prepare their teenagers for financial independence.",
      "author": "The Globe and Mail",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.theglobeandmail.com/life/parenting/"
    },
    {
      "id": 16,
      "title": "Creating Effective Family Routines: A Canadian Parent's Guide",
      "category": "Routines",
      "image": "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=500&fit=crop&q=80",
      "description": "Learn how successful Canadian families structure their days with realistic routines that reduce stress and promote independence in children.",
      "content": "Wouldn't it be awesome if you could stop feeling overwhelmed by all the daily tasks that seem never-ending? The answer for many Canadian families lies in creating effective routines that automate important processes and reduce stress. Successful family routines help children feel safe and secure, teaching them boundaries and how to behave while preparing them to take care of themselves as they grow older. For parents, routines help take away 'mom brain' and keep families organized. One Canadian family of four shares their approach: mornings start at 5:00 AM when mom wakes up for personal time including coffee and Bible reading, while kids wake at 6:30 AM and make their own breakfast (typically protein options like hard-boiled eggs or peanut butter with fruit). By 6:45 AM, kids make their own lunches as part of teaching independence, and at 7:00 AM they start morning devotions while mom changes laundry from a delayed-cycle wash. Weekly preparation is key—all big chores including meal prep, cleaning, lawn care, and errands happen on weekends so weekdays can focus on daily tasks. Nightly preparation includes resetting the house for the next day: backpacks out, breakfast set-up, dinner table set, clothes laid out. Experts recommend starting with one routine and sticking with it until it becomes habit before adding others. For many families, going to bed with a clean kitchen and putting away dishes during morning coffee brewing are foundational habits. The goal isn't perfection but finding a routine that brings peace and reduces the constant decision-making that exhausts parents. As one parent notes, 'These are the moments that make it all worthwhile.'",
      "author": "Simplified Motherhood",
      "saved": false,
      "isFeatured": true,
      "link": "https://simplifiedmotherhood.com/family-routine-examples/"
    },
    {
      "id": 17,
      "title": "Family Day 2025: Celebrating Canadian Family Values and Traditions",
      "category": "Routines",
      "image": "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1483653364400-eedcfb9f1f88?w=800&h=500&fit=crop&q=80",
      "description": "Family Day, celebrated on the third Monday of February across multiple provinces, provides Canadian families with dedicated time to reconnect and enjoy winter activities together.",
      "content": "Family Day 2025 was celebrated on Monday, February 17, across several Canadian provinces including Alberta, British Columbia, Ontario, New Brunswick, and Saskatchewan. While not a federal holiday, Family Day is a statutory holiday in these provinces, giving families a dedicated opportunity to spend quality time together during the long stretch between New Year's Day and Good Friday. First introduced in Alberta in 1990 by Premier Don Getty, Family Day was designed to emphasize the importance of family values and give working parents meaningful time with their children. Ontario adopted Family Day in 2007, followed by Saskatchewan in 2007 and British Columbia in 2013. Manitoba celebrates Louis Riel Day, Prince Edward Island observes Islander Day, and Nova Scotia has Heritage Day on the same date. Common Family Day activities include skating, playing hockey, snowboarding, skiing, and attending winter festivals. Many families use the long weekend for short trips or outdoor adventures like tobogganing, ice fishing, and hiking in scenic parks. Cities organize winter carnivals with live entertainment, food stalls, and fireworks. Indoor activities are equally popular, with families visiting aquariums, science centres, and heritage sites hosting interactive exhibits. In Toronto, major attractions including the Toronto Zoo, Royal Ontario Museum, and Art Gallery of Ontario offered special Family Day programming with discounted admission in 2025. Public libraries arranged storytelling sessions and arts and crafts workshops. The holiday represents more than just a day off—it's a reminder to never take family for granted and to cherish the moments spent together.",
      "author": "Family Day Canada",
      "saved": false,
      "isFeatured": false,
      "link": "https://familyday.ca/"
    },
    {
      "id": 18,
      "title": "Building Realistic Daily Schedules: Tips for Busy Canadian Families",
      "category": "Routines",
      "image": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=500&fit=crop&q=80",
      "description": "Expert advice on creating family schedules that work, with emphasis on flexibility, buffer time, and balancing structure with children's need for free play.",
      "content": "One of the best ways Canadian families can feel more in control and at peace is by creating the right daily schedule—one that provides structure without becoming overwhelming. The key is finding THE RIGHT schedule for your family, as trying to maintain an overly rigid schedule will just make parents feel like failures. When creating a family schedule, remember that the most important priority is the health and wellbeing of family members. If the thought of creating a highly structured environment causes stress, it may not be the right approach. The goal is finding what works for each unique family situation. Start by working the most important tasks (including sleep and self-care) into your schedule, then work through your list while planning space between tasks. As parents know, buffers are essential—life happens, and getting kids ready can take much longer than expected. This is the number one reason restrictive schedules become recipes for disaster. Something important to remember: children don't need everything scheduled. Research shows kids NEED free play—unstructured time without academic pressures. Tools and activities that provide unstructured free play include LEGOs, building blocks, art supplies, and outdoor play equipment. Many Canadian families create schedules in Word, print them out, laminate them, and post them where everyone can see so the schedule becomes routine. Free downloadable templates make this process easier. The most effective schedules balance necessary structure (like meal times, school routines, and bedtime) with flexibility for spontaneous family moments, individual needs, and the inevitable unexpected events that are part of family life.",
      "author": "The Incremental Mama",
      "saved": false,
      "isFeatured": false,
      "link": "https://theincrementalmama.com/daily-family-schedule-cooped-up/"
    },
    {
      "id": 19,
      "title": "Work-Life Balance for Canadian Families: Weekly Prep Strategies That Work",
      "category": "Routines",
      "image": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop&q=80",
      "description": "Canadian parents share proven strategies for managing full schedules through weekly and nightly preparation, reducing daily overwhelm.",
      "content": "Monday through Friday are FULL for most Canadian families, with little extra time for unexpected demands. One family's solution combines weekly preparation with nightly preparation to create a manageable routine. Weekly prep involves completing all big chores on weekends—meal prep, deep cleaning, lawn care, errands, and grocery shopping—so weekdays can focus purely on daily tasks and family time. This strategic approach prevents the overwhelm of trying to manage major tasks during busy weekdays when parents and children are managing work, school, and extracurricular activities. Nightly prep is equally crucial: each night before bed, successful families reset the house for the next day by laying out backpacks, setting up breakfast items, setting the dinner table for the following evening, laying out morning clothes, and tidying main living areas. Knowing that preparation is complete means that morning hiccups won't throw the family into a frenzy, bringing a huge sense of calm. Canadian working parents increasingly recognize that designing life based on daily priorities makes a significant difference. Decisions about where to live (proximity to school and work), work arrangements (including remote work options), and activity commitments are made considering how they affect day-to-day family life. Remote work has provided many Canadian parents with valuable time savings, as eliminating commutes translates to both time and money saved while providing more family interaction. The correlation between routine preparation and reduced parental stress is significant, with organized families reporting better mental health, stronger relationships, and more energy for enjoying meaningful moments together rather than constantly managing crisis situations.",
      "author": "Find Your Gold Home Organizing",
      "saved": false,
      "isFeatured": false,
      "link": "https://findyourgold.ca/blog/our-daily-routine-how-we-are-learning-to-thrive-as-a-busy-family-of-four"
    },
    {
      "id": 20,
      "title": "Simplifying Mornings: Canadian Families Share Time-Saving Routines",
      "category": "Routines",
      "image": "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1501290741922-b56c0d0884af?w=800&h=500&fit=crop&q=80",
      "description": "Practical morning routine strategies help Canadian families start their days smoothly, teaching children independence while reducing parental stress.",
      "content": "Mornings can be chaotic for Canadian families, but implementing strategic routines transforms this stressful time into a smooth start to the day. Many successful Canadian parents emphasize the value of waking early for personal time—not necessarily recommended for everyone, but those who do it report being significantly happier after alone time for activities they enjoy, whether that's exercise, reading, or simply enjoying quiet coffee time. For families with young children, teaching independence is a game-changer. Children as young as six can learn to make their own breakfast with easy protein options like hard-boiled eggs (prepared ahead) or peanut butter, combined with fruit and options like yogurt, oatmeal, or cereal. By age 10-12, many Canadian children can also prepare their own school lunches, a skill that not only saves time but teaches valuable life skills about nutrition and planning. Incorporating a 'pause' moment during busy mornings—one quiet activity together like reading, drawing, or simply talking—helps ground the family before everyone disperses for the day. This intentional moment of connection counterbalances the rush. Evening preparation is perhaps the most critical element of smooth mornings. When backpacks are ready, clothes are laid out, breakfast items are accessible, and lunches are prepared the night before, mornings shift from frantic scrambling to predictable routine. Canadian parents also emphasize the importance of buffer time—building extra minutes into the morning schedule for unexpected situations like clothing mishaps, forgotten homework, or a child moving slower than usual. The goal isn't achieving perfection but creating systems that work for each family's unique composition and schedule.",
      "author": "Canadian Parenting Resources",
      "saved": false,
      "isFeatured": true,
      "link": "https://simplifiedmotherhood.com/family-routine-examples/"
    },
    {
      "id": 21,
      "title": "Modern Parenting in Canada: Moving Beyond Sharenting and Gentle Parenting Extremes",
      "category": "Parenting",
      "image": "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=500&fit=crop&q=80",
      "description": "Canadian parents in 2025 are reevaluating 'sharenting' practices and seeking balanced approaches to gentle parenting that work for real families.",
      "content": "What a year 2024 was for Canadian parents, and 2025 promises a shift away from some controversial trends. 'Sharenting'—a term describing parents who share their children's lives online—has existed since the 2000s with mommy bloggers and family influencers, but increased dramatically during the pandemic. Now, some children of parenting influencers are growing up and sharing their negative experiences, leading to a 'sharenting reckoning.' Many Canadian parents are questioning whether constant documentation and sharing of children's lives on social media serves children's best interests, especially given privacy concerns and children's inability to consent. Another trend facing scrutiny is extreme interpretations of 'gentle parenting.' While gentle parenting styles center on acknowledging children's feelings and motivations behind challenging behaviors, some parents confuse 'gentle' with being overly permissive in every moment—an impossible standard setting parents up for failure. Experts emphasize that gentle parenting doesn't mean never setting boundaries or allowing children to make every decision. Meanwhile, concerns about 'safetyism' and overprotecting children through methods like constant hovering have prompted discussions about the importance of allowing age-appropriate risk-taking. The Canadian Paediatric Society notes that running free, taking chances, and even getting hurt are essential to healthy childhood development. Research shows engaging in risky outdoor behavior with peers is key to children's mental, physical, and social development. Canadian parents are increasingly seeking balanced approaches that combine reasonable safety measures with opportunities for children to develop independence and resilience. The goal is finding parenting strategies that work for real families in real situations, rather than pursuing impossible social media perfection.",
      "author": "CBC News",
      "saved": false,
      "isFeatured": true,
      "link": "https://www.cbc.ca/news/canada/parenting-trends-2025-1.7420111"
    },
    {
      "id": 22,
      "title": "Canadian Resources for Parents: Nobody's Perfect Program Supports Families",
      "category": "Parenting",
      "image": "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1546015720-b8b30df5aa27?w=800&h=500&fit=crop&q=80",
      "description": "Health Canada's Nobody's Perfect program offers accessible parenting information and support for Canadian families with children aged 0-5 years.",
      "content": "Health Canada provides comprehensive resources for Canadian parents and caregivers through programs like Nobody's Perfect, which offers current and accessible information on a variety of topics for families with children aged 0 to 5 years. The program recognizes that parenting is challenging and parents need support, not judgment. The series of tip sheets covers crucial topics including child behavior management, healthy child development, safety, nutrition, and family wellbeing. The materials can be used by the general public or as supplementary resources for formal parenting programs. Nobody's Perfect is an educational program specifically designed for parents of children from birth to age five, providing practical strategies that work in real family situations. Canada.ca's Just for You - Parents section provides extensive resources covering childhood development stages, teens and adolescent issues, school health programs including comprehensive school health approaches that promote healthy students in healthy schools, work-life balance strategies, and resources for responding to child abuse. The site emphasizes that injuries are the leading cause of death for children and youth under age 20, making injury prevention education critical. Parents can also access resources about children's oral health, with guidance noting it's never too early to start good oral hygiene habits even before the first tooth appears. The resources reflect Canada's commitment to supporting families through evidence-based information while recognizing the diversity of family structures and parenting approaches across the country. Additional support includes information about food allergies for school lunches, mental health resources, and connections to community programs that help parents feel less isolated in their parenting journey.",
      "author": "Health Canada",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.canada.ca/en/health-canada/services/healthy-living/just-for-you/parents.html"
    },
    {
      "id": 23,
      "title": "Parenting Through Divorce: Canadian Expert Advice on Supporting Children",
      "category": "Parenting",
      "image": "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=500&fit=crop&q=80",
      "description": "Canadian child psychologists provide guidance for parents navigating divorce, emphasizing honest communication and prioritizing children's emotional wellbeing.",
      "content": "When Canadian families face divorce, one of the most challenging questions parents ask is: 'What should we say to the kids?' Dr. Jillian Roberts and other Canadian child psychologists emphasize that honest, age-appropriate communication is essential. Children benefit from clear, simple explanations that reassure them the divorce is not their fault and that both parents will continue to love and care for them. Research shows that how parents handle the divorce process often matters more to children's long-term wellbeing than the divorce itself. Canadian parents navigating separation are encouraged to maintain consistency in routines as much as possible, avoid speaking negatively about the other parent in front of children, and reassure children that it's okay to love both parents. Many Canadian families are finding that co-parenting approaches focused on children's needs rather than parental conflict produce better outcomes. Resources like Today's Parent and ParentsCanada offer extensive guidance for families going through separation, including tips for maintaining healthy relationships with children, managing different households, introducing new partners, and handling holidays and special occasions. Generational differences in parenting approaches can become particularly apparent during divorce, with grandparents sometimes disagreeing with parents' decisions about how to handle the situation with children. Canadian family therapists note that these intergenerational conflicts require careful navigation to ensure children receive consistent messages and support. Parents are encouraged to seek professional support when needed, as mental health services for children dealing with family changes can prevent long-term negative impacts and help children develop healthy coping strategies.",
      "author": "Dr. Jillian Roberts",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.theglobeandmail.com/life/parenting/"
    },
    {
      "id": 24,
      "title": "Raising Financially Responsible Teens: Canadian Parenting Perspectives",
      "category": "Parenting",
      "image": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&h=500&fit=crop&q=80",
      "description": "Canadian parents and educators share strategies for teaching teenagers essential financial skills and preparing them for economic independence.",
      "content": "Ontario high school teachers report that kids today are increasingly worried about money and their future, making financial education more critical than ever for Canadian parents. By the time children reach 18 years old, there are 11 essential life skills they should have mastered according to Canadian parenting experts, with financial literacy ranking high on that list. Many Canadian parents worry they can't afford to leave an inheritance for their children, yet their kids may be banking on one—this disconnect highlights the importance of having honest financial conversations. Parents should discuss expectations openly, explaining that ensuring their own financial security (including adequate life insurance) must come first. As university acceptance letters arrive, Canadian parents face an important opportunity to tackle money topics with teenagers, including understanding the true cost of post-secondary education, learning about student loans and lines of credit, and developing practical budgeting skills. Ontario's Ministry of Education recognizes this importance, mandating financial literacy modules in Grades 9 and 10 to ensure students learn key money management skills. Canadian parenting resources emphasize that parents should model healthy financial behaviors including maintaining budgets, discussing household financial decisions appropriately, teaching the difference between needs and wants, and involving teenagers in family financial planning where appropriate. Resources from Focus on the Family Canada and other organizations provide guidance on teaching children about finances, including earning, saving, charitable giving, and responsible spending. With the average undergraduate program costing $6,580 annually and many students graduating with significant debt, preparing teenagers with strong financial literacy skills has become a crucial parenting responsibility that can significantly impact their future financial wellbeing and success.",
      "author": "Today's Parent",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.todaysparent.com/"
    },
    {
      "id": 25,
      "title": "Supporting Children's Mental Health: Canadian Parent Resources for 2025",
      "category": "Parenting",
      "image": "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=500&fit=crop&q=80",
      "description": "With youth mental health challenges at unprecedented levels, Canadian parents access new resources and programs designed to support children's emotional wellbeing.",
      "content": "Young Canadians face unprecedented mental health challenges, with rates three times worse than pre-pandemic levels according to the Canadian Mental Health Association. For parents, this reality makes accessing mental health resources and understanding how to support children's emotional wellbeing more critical than ever. In September 2025, the Government of Canada announced over $30 million in funding to strengthen Integrated Youth Services networks across the country, providing youth aged 12-25 and their families with single, accessible places to find help with mental health, substance use, physical health, housing, and peer support. Ontario's updated curriculum includes mandatory mental health literacy in Grade 10 Career Studies, recognizing the importance of equipping students with tools to understand and manage their wellbeing. Canadian parents can access numerous resources including Health Canada's Just for You - Parents section, which provides evidence-based information about childhood development and mental health support. ParentsCanada offers weekly newsletters with expert advice and practical tips, while Today's Parent provides comprehensive articles addressing everything from screen time impacts to supporting kids through difficult emotions. Focus on the Family Canada offers counseling resources and educational materials for parents dealing with various challenges including depression, anxiety, self-harm, and behavioral issues. Canadian Mental Health Association's Mental Health Week campaigns help families understand mental health topics and reduce stigma. Parents are encouraged to watch for signs their children may need additional support and to seek professional help when needed. Three key parenting strategies support children's mental health: maintaining open communication where children feel safe expressing emotions, modeling healthy emotional regulation and coping strategies, and maintaining consistent routines that provide security and predictability.",
      "author": "Canadian Mental Health Association",
      "saved": false,
      "isFeatured": true,
      "link": "https://www.canada.ca/en/institutes-health-research/news/2025/09/government-of-canada-invests-in-research-to-inform-better-youth-mental-health-and-wellness-services-across-the-country.html"
    },
    {
      "id": 26,
      "title": "Physical Activity Guidelines: Moving More for Better Health",
      "category": "Health",
      "image": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=500&fit=crop&q=80",
      "description": "Canadian adults are encouraged to achieve at least 150 minutes of moderate-to-vigorous physical activity weekly to reduce disease risk and improve overall health.",
      "content": "Physical activity plays a crucial role in maintaining good health and preventing chronic diseases. Health Canada and the Canadian Society for Exercise Physiology recommend that adults aged 18-64 accumulate at least 150 minutes of moderate to vigorous-intensity aerobic physical activity per week, in bouts of 10 minutes or more. Additionally, muscle and bone strengthening activities using major muscle groups should be incorporated at least 2 days per week. Regular physical activity helps reduce the risk of premature death, heart disease, stroke, high blood pressure, certain types of cancer, type 2 diabetes, osteoporosis, overweight and obesity, and can improve fitness, strength, mental health, and overall quality of life.",
      "author": "Health Canada",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.canada.ca/en/public-health/services/being-active.html"
    },
    {
      "id": 27,
      "title": "Healthcare Trends 2025: Addressing Inequities and Mental Health Crisis",
      "category": "Health",
      "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=500&fit=crop&q=80",
      "description": "As Canada faces federal elections and healthcare system pressures, experts identify key trends including mental health investments, digital transformation, and equity initiatives.",
      "content": "Canada's healthcare landscape in 2025 is characterized by significant challenges and transformative initiatives. The mental health crisis continues to demand attention, with the federal government's $30 million investment in Integrated Youth Services representing a major commitment to addressing unprecedented youth mental health challenges. Digital health transformation accelerates with expanded virtual care options and electronic health records integration. Healthcare equity emerges as a priority, with targeted programs addressing disparities in Indigenous communities and underserved populations.",
      "author": "Canadian Healthcare Association",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.canada.ca/en/health-canada.html"
    },
    {
      "id": 28,
      "title": "Sleep Health: Importance of Quality Rest for Canadians",
      "category": "Health",
      "image": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=800&h=500&fit=crop&q=80",
      "description": "Sleep experts emphasize the critical role of quality sleep in physical and mental health, recommending 7-9 hours nightly for adults.",
      "content": "Quality sleep is fundamental to good health, yet many Canadians struggle with sleep disorders and insufficient rest. The Canadian Sleep Society recommends adults get 7-9 hours of sleep per night, while teenagers need 8-10 hours and younger children require even more. Poor sleep is linked to increased risk of obesity, diabetes, cardiovascular disease, depression, and weakened immune function. Sleep hygiene practices include maintaining consistent sleep schedules, creating a comfortable sleep environment, limiting screen time before bed, and avoiding caffeine and alcohol close to bedtime.",
      "author": "Canadian Sleep Society",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.canada.ca/en/public-health/services/healthy-living.html"
    },
    {
      "id": 29,
      "title": "Vaccination Programs: Protecting Canadian Communities",
      "category": "Health",
      "image": "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=500&fit=crop&q=80",
      "description": "Canada's robust vaccination programs continue to protect communities from preventable diseases while addressing vaccine hesitancy through education.",
      "content": "Canada maintains comprehensive vaccination programs covering childhood immunizations, adult vaccines, and seasonal flu shots. Public health officials emphasize that vaccines have prevented millions of deaths and continue to be among the most effective public health interventions. Recent efforts focus on combating misinformation and vaccine hesitancy through community education and engagement programs.",
      "author": "Public Health Agency of Canada",
      "saved": false,
      "isFeatured": false,
      "link": "https://www.canada.ca/en/public-health/services/immunization-vaccines.html"
    },
    {
      "id": 30,
      "title": "Stress Management Strategies for Modern Canadians",
      "category": "Health",
      "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=500&fit=crop&q=80",
      "image1": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=500&fit=crop&q=80",
      "description": "Mental health experts share evidence-based stress management techniques to help Canadians cope with daily pressures and build resilience.",
      "content": "Chronic stress affects millions of Canadians, impacting both physical and mental health. Effective stress management strategies include regular physical activity, mindfulness meditation, deep breathing exercises, maintaining social connections, setting boundaries, and seeking professional help when needed. The Canadian Mental Health Association provides resources and programs to help individuals develop healthy coping mechanisms and build emotional resilience.",
      "author": "Canadian Mental Health Association",
      "saved": false,
      "isFeatured": false,
      "link": "https://cmha.ca/"
    }
  ]
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Article.deleteMany({});
    console.log('🗑️  Cleared existing articles');

    const articles = articlesData.articles.map(article => ({
      title: article.title,
      category: article.category,
      image: article.image,
      image1: article.image1,
      description: article.description,
      content: article.content,
      author: article.author,
      isFeatured: article.isFeatured,
      link: article.link || null,
      status: 'published',
      viewCount: 0
    }));

    await Article.insertMany(articles);
    console.log(`✅ Successfully seeded ${articles.length} articles`);

    const categories = {};
    articles.forEach(article => {
      categories[article.category] = (categories[article.category] || 0) + 1;
    });
    
    console.log('\n📊 Summary by Category:');
    Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} articles`);
    });

    mongoose.connection.close();
    console.log('\n✅ Database seeding complete!');
    console.log('🎯 All 30 Canadian articles have been added');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();