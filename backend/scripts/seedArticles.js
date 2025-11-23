// backend/scripts/seedAllArticles.js
const mongoose = require("mongoose");
require("dotenv").config();

const Article = require("../models/Article");

const articlesData = {
  categories: ["Health", "Education", "Finances", "Routines", "Parenting"],
  articles: [
    // ============ HEALTH ARTICLES (10) ============
    {
      id: 1,
      title: "Healthy Sleep Habits for Babies and Toddlers",
      category: "Health",
      image:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=500&fit=crop&q=80",
      description:
        "Establish healthy sleep patterns from infancy through toddlerhood with expert-backed strategies that help the whole family rest better.",
      content:
        "Sleep is essential for your child's growth, development, and behavior. Newborns need 14-17 hours of sleep per day, infants need 12-16 hours including naps, and toddlers need 11-14 hours. Establish a consistent bedtime routine early—bath time, storytime, and lullabies signal that sleep is coming. Keep the bedroom dark, quiet, and cool (68-72°F is ideal). Place babies on their backs to sleep to reduce SIDS risk. Avoid screens for at least one hour before bedtime as blue light interferes with melatonin production. For babies learning to self-soothe, wait a few minutes before responding to nighttime fussing—they may settle on their own. Sleep regressions are normal around 4 months, 8 months, and 18 months as development progresses. During these times, maintain your routine even if progress seems to backslide. Nap schedules change as children grow—infants typically take 2-3 naps while toddlers transition to one afternoon nap. Watch for sleepy cues like eye rubbing, yawning, or fussiness to prevent overtiredness. A well-rested child is happier, healthier, and better able to learn and play.",
      author: "American Academy of Pediatrics",
      saved: false,
      isFeatured: true,
      link: "https://www.healthychildren.org/English/healthy-living/sleep/Pages/default.aspx",
    },
    {
      id: 2,
      title:
        "Understanding Childhood Vaccinations: A Complete Guide for Parents",
      category: "Health",
      image:
        "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&h=500&fit=crop&q=80",
      description:
        "Everything parents need to know about childhood immunizations, vaccine schedules, and protecting your children from preventable diseases.",
      content:
        "Vaccinations are one of the most important ways to protect your child's health. The recommended vaccine schedule protects children from 14 serious diseases before age 2. Vaccines work by teaching the immune system to recognize and fight diseases. Common childhood vaccines include DTaP (diphtheria, tetanus, pertussis), MMR (measles, mumps, rubella), polio, hepatitis B, and chickenpox vaccines. Side effects are usually mild, such as soreness at the injection site or low-grade fever. Serious side effects are extremely rare. Talk to your pediatrician about any concerns you have. Staying on schedule with vaccinations is crucial because babies are most vulnerable to disease in their first years of life. Many vaccines require multiple doses to build full immunity. Keep accurate records of your child's vaccinations for school enrollment and travel. If you've missed appointments, catch-up schedules are available. Remember that vaccinating your child also protects others in your community who may be too young or unable to be vaccinated themselves.",
      author: "Centers for Disease Control and Prevention",
      saved: false,
      isFeatured: true,
      link: "https://www.cdc.gov/vaccines/parents/index.html",
    },
    {
      id: 3,
      title: "Nutrition Guidelines for Growing Children: Birth to Age 5",
      category: "Health",
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop&q=80",
      description:
        "Learn what and how to feed your child from infancy through preschool years to support healthy growth and development.",
      content:
        "Proper nutrition lays the foundation for lifelong health. For infants 0-6 months, breast milk or formula provides complete nutrition. Introduce solid foods around 6 months, starting with iron-fortified single-grain cereals, then pureed vegetables and fruits. Offer a variety of textures and flavors to develop adventurous eaters. By age 1, children can eat most family foods cut into small, safe pieces. Toddlers need 1,000-1,400 calories daily from fruits, vegetables, grains, protein, and dairy. Serve meals and snacks at consistent times to establish routine. Offer 2-3 healthy snacks between meals. Limit juice to 4 oz daily—whole fruits are better. Avoid added sugars for children under 2, and limit them afterward. Include healthy fats like avocado, nut butters (if no allergies), and olive oil for brain development. Make half the plate fruits and vegetables at each meal. Let children serve themselves from family-style bowls to learn hunger and fullness cues. Don't force eating or use food as reward or punishment. Picky eating is normal—continue offering rejected foods without pressure. It can take 10-15 exposures before acceptance. Model healthy eating yourself as children copy what they see. Stay patient and remember that eating patterns established now shape lifelong habits.",
      author: "Health Canada",
      saved: false,
      isFeatured: false,
      link: "https://www.canada.ca/en/health-canada/services/canada-food-guides.html",
    },
    {
      id: 4,
      title: "Managing Common Childhood Illnesses: When to Call the Doctor",
      category: "Health",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=500&fit=crop&q=80",
      description:
        "Recognize symptoms of common childhood illnesses and know when home care is sufficient versus when medical attention is needed.",
      content:
        "Every parent worries when their child gets sick. Most childhood illnesses are viral and resolve with home care. For fevers, call the doctor if your baby under 3 months has any fever, if fever exceeds 104°F in older children, or if fever lasts more than 3 days. Treat fever with acetaminophen or ibuprofen (check dosing by weight). Colds are normal—children may get 8-10 per year. Use a cool-mist humidifier and nasal saline drops for congestion. Never give cough and cold medicines to children under 4. Seek care if breathing becomes difficult or wheezing occurs. Ear infections often follow colds. Signs include ear tugging, irritability, and fever. Some resolve without antibiotics, but see your doctor if symptoms persist beyond 2-3 days. For vomiting and diarrhea, prevent dehydration by offering small, frequent sips of clear fluids or electrolyte solutions. Call if there are signs of dehydration: dry mouth, no tears, fewer wet diapers, lethargy. Rashes are common but call if accompanied by high fever, purple spots that don't blanch, or if the child seems very ill. Trust your instincts—you know your child best. If something feels wrong, contact your pediatrician. Keep emergency numbers readily available and know the location of the nearest urgent care or ER.",
      author: "Canadian Paediatric Society",
      saved: false,
      isFeatured: false,
      link: "https://caringforkids.cps.ca/handouts/health-conditions-and-treatments/fever_and_temperature_taking",
    },
    {
      id: 5,
      title: "Dental Care for Children: First Tooth to First Visit",
      category: "Health",
      image:
        "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&h=500&fit=crop&q=80",
      description:
        "Start your child's dental health journey right with proper care from the very first tooth through early childhood.",
      content:
        "Good dental habits begin early. Clean your baby's gums with a soft, damp cloth even before teeth appear. When the first tooth erupts (usually around 6 months), begin brushing twice daily with a soft-bristled toothbrush and water. Use a rice-grain-sized smear of fluoride toothpaste once teeth touch each other. Increase to a pea-sized amount at age 3. Schedule the first dental visit by age 1 or within 6 months of the first tooth appearing. Early visits help children become comfortable with the dentist and catch potential problems early. Never put a baby to bed with a bottle—milk or juice pooling around teeth causes decay. Transition from bottle to cup by 12-18 months. Limit sugary foods and drinks. Offer water between meals instead of juice or milk. Teach children to brush for 2 minutes twice daily—use songs or timers to make it fun. Parents should brush until age 6-7 when children have the dexterity to do it properly. Don't forget to floss once teeth touch! Fluoride strengthens teeth and prevents cavities. Ask your dentist if your water supply contains fluoride or if supplements are needed. Protect teeth during sports with mouthguards. Address thumb-sucking or pacifier use by age 3-4 to prevent dental problems. Baby teeth matter—they hold space for permanent teeth and affect speech development.",
      author: "Canadian Dental Association",
      saved: false,
      isFeatured: true,
      link: "https://www.cda-adc.ca/en/oral_health/life_stages/babies_children/",
    },
    {
      id: 6,
      title:
        "Screen Time Guidelines: Balancing Technology and Child Development",
      category: "Health",
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=800&h=500&fit=crop&q=80",
      description:
        "Navigate the digital world with evidence-based screen time recommendations that support healthy development from infancy through school age.",
      content:
        "In our connected world, managing children's screen time is crucial for healthy development. The American Academy of Pediatrics recommends no screen time for children under 18 months except video chatting. For ages 18-24 months, choose high-quality programming and watch together to help understanding. Limit screen time to 1 hour daily of quality content for ages 2-5, always co-viewing when possible. For children 6 and older, set consistent limits that ensure screen time doesn't interfere with sleep, physical activity, and face-to-face interactions. Create screen-free zones—no devices during meals or in bedrooms. Establish screen-free times, especially one hour before bedtime, as screens interfere with sleep. Model healthy screen habits yourself—children copy what they see. Not all screen time is equal—interactive, educational content is better than passive viewing. Co-viewing helps children understand and apply what they see. Use parental controls and privacy settings to protect children online. Teach digital citizenship and critical thinking about online content. Watch for signs screens are interfering with development: speech delays, behavior problems, difficulty focusing, or lack of interest in other activities. Encourage alternative activities: outdoor play, reading, arts and crafts, imaginative play. Balance is key—technology isn't inherently bad, but it shouldn't replace active play, reading, and human interaction essential for development.",
      author: "American Academy of Pediatrics",
      saved: false,
      isFeatured: false,
      link: "https://www.healthychildren.org/English/family-life/Media/Pages/default.aspx",
    },
    {
      id: 7,
      title:
        "Building Strong Immunity: Supporting Your Child's Health Naturally",
      category: "Health",
      image:
        "https://images.unsplash.com/photo-1628527304948-06157ee3c8a6?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=500&fit=crop&q=80",
      description:
        "Learn how proper nutrition, sleep, hygiene, and lifestyle choices strengthen your child's immune system and reduce illness frequency.",
      content:
        "A strong immune system helps children fight off infections and stay healthy. While you can't prevent every illness, you can support your child's natural defenses. Nutrition is fundamental—ensure adequate intake of vitamins A, C, D, and zinc through colorful fruits and vegetables, whole grains, lean proteins, and dairy. If diet is limited, discuss supplements with your pediatrician. Sleep is when the body repairs and strengthens immunity. Follow age-appropriate sleep recommendations strictly. Chronic sleep deprivation increases illness susceptibility. Physical activity boosts immune function. Encourage at least 60 minutes of active play daily—running, jumping, climbing, dancing. Outdoor time is especially beneficial. Teach proper hygiene early: handwashing with soap for 20 seconds after using the bathroom, before eating, and after playing outside. Make it fun with songs. Manage stress—even young children experience stress that can weaken immunity. Provide stable routines, plenty of hugs, and opportunities to express feelings. Limit exposure to tobacco smoke, which damages developing lungs and weakens immunity. Keep vaccinations current—they prime the immune system to recognize and fight serious diseases. Avoid overusing antibiotics, which don't work on viruses and can harm gut bacteria important for immunity. Probiotics may help—found in yogurt or as supplements. Stay hydrated with water, not sugary drinks. Don't obsess over cleanliness—exposure to everyday germs helps train the immune system. Focus on hand hygiene but let kids play and explore.",
      author: "KidsHealth from Nemours",
      saved: false,
      isFeatured: false,
      link: "https://kidshealth.org/en/parents/immune.html",
    },
    {
      id: 8,
      title:
        "Understanding Food Allergies in Children: Prevention and Management",
      category: "Health",
      image:
        "https://images.unsplash.com/photo-1505778276668-26b3ff7af103?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=500&fit=crop&q=80",
      description:
        "Navigate food allergies with confidence—from early introduction strategies to managing diagnosed allergies and emergency preparedness.",
      content:
        "Food allergies affect approximately 1 in 13 children. The most common allergens are milk, eggs, peanuts, tree nuts, soy, wheat, fish, and shellfish. Recent research shows early introduction of potential allergens may reduce allergy risk. For babies at high risk (severe eczema or egg allergy), introduce peanut-containing foods as early as 4-6 months after consulting your pediatrician. For others, introduce around 6 months alongside other solid foods. Start with small amounts and wait 3-5 days between new foods to identify reactions. Signs of allergic reaction include hives, rash, swelling of lips or face, vomiting, diarrhea, coughing, wheezing, or difficulty breathing. Severe reactions (anaphylaxis) require immediate epinephrine injection and emergency care. If your child is diagnosed with food allergies, work with an allergist to develop an emergency action plan. Carry prescribed epinephrine auto-injectors always and ensure caregivers know how to use them. Read food labels carefully—allergens must be clearly listed. Be cautious of cross-contamination in kitchens and restaurants. Educate family members, babysitters, teachers, and other parents about your child's allergies. Don't send homemade treats to school unless approved. Some children outgrow allergies, particularly milk and egg allergies. Your allergist can test periodically to assess this. Living with food allergies requires vigilance but shouldn't prevent children from living full, active lives. Connect with support groups for tips and emotional support.",
      author: "Food Allergy Canada",
      saved: false,
      isFeatured: false,
      link: "https://foodallergycanada.ca/",
    },
    {
      id: 9,
      title: "Mental Health Matters: Supporting Emotional Wellness in Children",
      category: "Health",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=800&h=500&fit=crop&q=80",
      description:
        "Recognize signs of emotional struggles and learn how to nurture mental health from early childhood through the elementary years.",
      content:
        "Children's mental health is as important as physical health. One in six children ages 2-8 has a diagnosed mental, behavioral, or developmental disorder. Early intervention makes a significant difference. Mental health includes emotional, psychological, and social well-being. It affects how children think, feel, act, handle stress, relate to others, and make choices. Warning signs vary by age but may include persistent sadness, withdrawal from friends or activities, excessive fears or worries, extreme behavior changes, difficulty concentrating, changes in eating or sleeping, physical symptoms without clear medical cause, talking about death or suicide. Create a supportive environment: establish routines that provide security, show unconditional love, listen without judgment, validate feelings while teaching healthy emotional expression, set clear, consistent limits, praise effort not just achievement, encourage healthy peer relationships, model healthy coping strategies yourself. Teach emotional literacy—help children identify and name feelings. Use books, games, and conversations. Promote resilience through small challenges they can overcome. Limit stress exposure but teach healthy stress management: deep breathing, physical activity, creative expression, talking about problems. Address trauma promptly—abuse, loss, divorce, disasters affect mental health. Seek professional help if needed. Don't wait for problems to become severe. Talk to your pediatrician about concerns. Mental health treatment might include counseling, family therapy, or medication. There's no shame in seeking help—it's a sign of strength and good parenting.",
      author: "Child Mind Institute",
      saved: false,
      isFeatured: true,
      link: "https://childmind.org/topics/concerns/mental-health/",
    },
    {
      id: 10,
      title: "Active Play and Physical Development: Age-by-Age Milestones",
      category: "Health",
      image:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=500&fit=crop&q=80",
      description:
        "Track your child's physical development and discover activities that promote gross and fine motor skills at every age.",
      content:
        "Physical development progresses in predictable patterns, though timing varies. Infants develop head control, then rolling, sitting, crawling, and walking—usually by 12-15 months. Encourage tummy time from birth to strengthen neck and shoulder muscles. Provide safe spaces for movement exploration. Toddlers (1-3 years) master walking, running, climbing, and kicking balls. They develop fine motor skills like scribbling, stacking blocks, and self-feeding. Provide opportunities for active play daily—playground time, dance parties, ball play. Preschoolers (3-5 years) refine balance, coordination, and strength. They can hop, jump, pedal trikes, catch balls, use scissors, and draw shapes. Structured activities like swimming or gymnastics can help, but free play is most important. School-age children (6+ years) develop sport-specific skills, improved coordination, and increased strength. Encourage at least 60 minutes daily of moderate to vigorous activity. Vary activities to develop different skills and prevent overuse injuries. Support interests but don't over-schedule. Limit screen time which replaces active play. Make physical activity a family priority—bike rides, hikes, active games together. Physical development supports cognitive and social development too. Movement helps children learn, manage emotions, and build confidence. Celebrate progress without comparing to others—children develop at their own pace. Consult your pediatrician if your child seems significantly delayed in reaching milestones or if you have concerns about coordination or strength.",
      author: "Centers for Disease Control and Prevention",
      saved: false,
      isFeatured: false,
      link: "https://www.cdc.gov/ncbddd/actearly/milestones/index.html",
    },

    // ============ EDUCATION ARTICLES (5) ============
    {
      id: 11,
      title: "Kindergarten Readiness: Preparing Your Child for School Success",
      category: "Education",
      image:
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=500&fit=crop&q=80",
      description:
        "Essential skills and strategies to help your child transition smoothly into kindergarten, from social skills to basic academics.",
      content:
        "Starting kindergarten is a major milestone. While academic skills matter, social-emotional readiness is equally important. Children should be able to separate from parents, follow simple directions, take turns, share, and express needs appropriately. They should manage basic self-care: using the bathroom independently, washing hands, putting on coats, and eating without help. Fine motor skills matter—holding crayons, using scissors, and manipulating small objects. Gross motor skills like running, jumping, and balancing support playground success. Pre-academic skills include recognizing some letters and numbers, counting to 10, recognizing basic shapes and colors, writing their first name, holding books correctly, and understanding stories. However, don't stress if your child hasn't mastered everything—kindergarten teaches these skills. Focus on fostering curiosity and love of learning. Read together daily, pointing out letters and words. Count everyday objects. Discuss colors, shapes, and patterns you see. Practice writing and drawing. Visit the school before the first day if possible. Talk positively about school. Establish consistent routines for morning and bedtime to ease the transition. Practice independence: dressing themselves, packing backpacks, opening lunch containers. Play 'school' at home to familiarize them with concepts like raising hands and sitting during circle time. Address fears or anxiety openly. Remember that chronological age alone doesn't determine readiness—consider your child's individual development when deciding whether to start on time or wait a year.",
      author: "Government of Canada",
      saved: false,
      isFeatured: true,
      link: "https://www.canada.ca/en/services/benefits/education.html",
    },
    {
      id: 12,
      title: "Reading Together: Building Literacy from Birth to Age 8",
      category: "Education",
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=500&fit=crop&q=80",
      description:
        "Discover how daily reading builds vocabulary, comprehension, and a lifelong love of books in children from infancy through early elementary years.",
      content:
        "Reading aloud is the single most important activity for building literacy skills. Start from birth—babies benefit from hearing language rhythms and seeing books. For infants, choose board books with simple pictures and textures. Point to and name objects. Even if they seem disinterested, you're building neural pathways. Toddlers enjoy repetitive stories, rhymes, and interactive books. They'll want to hear favorites repeatedly—this repetition builds language skills. Let them turn pages and point to pictures. Preschoolers can follow more complex stories and make predictions. Ask questions: 'What do you think happens next?' 'How does the character feel?' Connect stories to their own experiences. Early readers (ages 5-7) are learning to decode words. Continue reading aloud even as they learn to read themselves—you can share more complex stories that build vocabulary and comprehension beyond their reading level. Also let them read to you, praising effort over perfection. School-age children (8+) benefit from chapter books read together. Discuss themes, characters, and plot. Relate stories to real-world situations. Visit the library regularly—make it an adventure. Let children choose books that interest them, even if they seem too easy or outside typical choices. The goal is fostering love of reading. Create a reading-friendly environment: cozy reading nooks, accessible books, limited screens. Model reading yourself. Establish a bedtime reading routine. Read 20 minutes daily minimum. Children who read for pleasure perform better academically across all subjects.",
      author: "Reading Rockets",
      saved: false,
      isFeatured: true,
      link: "https://www.readingrockets.org/topics/reading-aloud",
    },
    {
      id: 13,
      title: "Homework Help: Creating a Productive Study Environment at Home",
      category: "Education",
      image:
        "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop&q=80",
      description:
        "Support your school-age child's academic success with strategies for homework routines, study spaces, and fostering independence.",
      content:
        "Effective homework habits set children up for academic success. Create a consistent homework time and place. Some children work best right after school; others need a break first. Find what works for your child and stick to it. The homework space should be quiet, well-lit, and free from distractions. Stock it with necessary supplies: pencils, paper, crayons, scissors, glue, dictionary, and age-appropriate reference materials. Minimize screen distractions. Be available to help but don't do the work for them. Start by asking what they need to accomplish and help them plan their approach. If they're stuck, guide them to find answers rather than providing them. Encourage problem-solving: 'What strategies could you try?' Break large assignments into manageable chunks. Use timers for focus periods (10-20 minutes for younger children, longer for older). Build in short breaks. For children who struggle, work with teachers to ensure homework difficulty is appropriate. Too much frustration damages motivation. Celebrate effort and improvement, not just perfect scores. Homework teaches responsibility and time management, not just academic content. Older elementary children should manage their assignments with decreasing parental oversight. Help them use planners to track assignments and due dates. Teach prioritization—harder or longer tasks first while fresh. If your child consistently struggles or takes excessive time, communicate with teachers. Homework shouldn't dominate family time or cause regular tears and battles. Balance is essential for wellbeing.",
      author: "Ontario Ministry of Education",
      saved: false,
      isFeatured: false,
      link: "https://www.ontario.ca/page/education-ontario",
    },
    {
      id: 14,
      title: "STEM Learning at Home: Fun Activities for Young Minds",
      category: "Education",
      image:
        "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=500&fit=crop&q=80",
      description:
        "Engage children in science, technology, engineering, and math through everyday activities that spark curiosity and problem-solving skills.",
      content:
        "STEM learning doesn't require fancy equipment—curiosity and everyday materials work wonderfully. For preschoolers, simple activities build foundational skills: sorting objects by color or size (math), exploring water with containers of different sizes (science), building with blocks (engineering), or using simple apps that teach cause-and-effect (technology). Elementary-age children can tackle more complex projects. Science: Grow plants from seeds, create volcanoes with baking soda and vinegar, observe insects or birds, explore states of matter by making ice cream. Technology: Learn basic coding with free resources like Scratch or Code.org, take apart old electronics (safely) to see components, create stop-motion animations. Engineering: Build bridges from popsicle sticks, create marble runs, construct catapults, design and test paper airplanes. Math: Cook together (measuring), play board games involving strategy, create patterns with household objects, estimate and then measure items, explore shapes in nature. Ask open-ended questions: 'What do you think will happen if...?' 'Why do you think that happened?' 'How could we make it better?' Encourage trial and error—failure teaches problem-solving. Document experiments with photos or journals. Visit science museums, planetariums, and nature centers. Watch age-appropriate documentaries together. Follow children's interests—if they love dinosaurs, explore paleontology; if fascinated by weather, study meteorology. The goal is developing scientific thinking: observing, hypothesizing, testing, and drawing conclusions. These skills apply far beyond science careers—they're essential life skills.",
      author: "PBS Kids",
      saved: false,
      isFeatured: false,
      link: "https://www.pbs.org/parents/learn-grow",
    },
    {
      id: 15,
      title:
        "Supporting Different Learning Styles: Visual, Auditory, and Kinesthetic Learners",
      category: "Education",
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=500&fit=crop&q=80",
      description:
        "Identify your child's learning style and discover strategies to help them thrive academically by teaching to their strengths.",
      content:
        "Children learn differently, and understanding your child's preferred learning style helps you support them effectively. Visual learners understand information best through seeing. They benefit from charts, diagrams, pictures, written directions, color-coding, graphic organizers, and watching demonstrations. Help them by using flashcards, drawing pictures to represent concepts, creating mind maps, watching educational videos, and organizing study areas visually. Auditory learners process information through listening. They benefit from verbal instructions, discussions, reading aloud, mnemonic devices, rhymes, and music. Help them by discussing topics verbally, recording themselves reading notes to play back, using audiobooks, studying with a friend to talk through concepts, and creating songs or rhymes to remember information. Kinesthetic learners understand through movement and hands-on activities. They benefit from building models, role-playing, frequent breaks to move, manipulatives, experiments, and field trips. Help them by incorporating movement into learning (counting while jumping, acting out stories), using tactile materials, taking frequent activity breaks, building or crafting to represent concepts, and studying while bouncing on an exercise ball. Most children use a combination of styles but usually have a preference. Observe what activities engage them most. In reality, effective learning uses all modalities—the more senses involved, the better retention. Encourage children to try different strategies to find what works. Don't use learning styles as limitations—instead, use them as tools to enhance learning. Communicate your child's preferences to teachers to support classroom success.",
      author: "Today's Parent Canada",
      saved: false,
      isFeatured: false,
      link: "https://www.todaysparent.com/",
    },

    // ============ FINANCES ARTICLES (5) ============
    {
      id: 16,
      title: "Teaching Kids About Money: Age-Appropriate Financial Lessons",
      category: "Finances",
      image:
        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop&q=80",
      description:
        "Build financial literacy from preschool through middle school with practical lessons that prepare children for economic independence.",
      content:
        "Financial education starts early. Preschoolers (ages 3-5) can learn basic concepts: you need money to buy things, you earn money by working, waiting before buying (delayed gratification), needs versus wants. Use play stores and toy money to practice. Give them small choices: 'Would you rather have grapes or crackers for snack?' Elementary ages (6-10) can learn more complex concepts. Start an allowance—weekly is best for younger children. Consider dividing money into spending, saving, and sharing jars. Teach comparison shopping at the store. Let them experience both good and bad purchase decisions. Open a savings account and involve them in deposits. Explain interest simply: 'The bank pays you a little extra for keeping money there.' Introduce earning opportunities beyond allowance: extra chores, neighborhood jobs like pet-sitting. Pre-teens (11-13) can learn budgeting. Help them budget their allowance for various categories. Discuss family financial decisions appropriately: 'We're saving for vacation, so we're eating at home more.' Teach about advertising and peer pressure. Explain credit cards—money borrowed must be repaid with interest. Involve them in charitable giving decisions. Model healthy financial behaviors yourself. Avoid using money as punishment or reward for behavior—it should be tied to effort and responsibility. Discuss family values around money. Make mistakes learning opportunities without shame. Children who learn financial literacy early develop better money management skills, make smarter financial decisions, experience less money stress as adults, and achieve greater financial security throughout life.",
      author: "Consumer Financial Protection Bureau",
      saved: false,
      isFeatured: true,
      link: "https://www.consumerfinance.gov/consumer-tools/money-as-you-grow/",
    },
    {
      id: 17,
      title:
        "Budgeting for Baby: First-Year Financial Planning for New Parents",
      category: "Finances",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&h=500&fit=crop&q=80",
      description:
        "Navigate the financial reality of welcoming a baby with strategies for budgeting, saving on essentials, and planning for parental leave.",
      content:
        "The first year with a baby costs an average of $12,000-$15,000, but smart planning reduces financial stress. Before baby arrives, review your budget and identify areas to cut. Build an emergency fund covering 3-6 months of expenses if possible. Understand your parental leave benefits and budget for potential lost income. Essential expenses include diapers ($70-80/month), formula if not breastfeeding ($150-300/month), childcare if both parents work ($200-2,000+/month depending on location and type), increased healthcare costs (check insurance deductibles and co-pays), clothing (babies outgrow things quickly), and safe sleep items (crib/bassinet, firm mattress). Save money by accepting hand-me-downs from trusted sources, borrowing big-ticket items you'll use briefly (infant tubs, swings), buying generic brands (diapers, wipes, and formula are comparable to name brands), cloth diapering if feasible (initial investment but long-term savings), breastfeeding if possible (not always an option but saves substantially), limiting unnecessary gear—babies need less than marketing suggests. Skip: wipe warmers, diaper genies (regular trash works), expensive bedding (not safe for infant sleep anyway), dozens of outfits (they live in onesies), and trendy but impractical items. Create a registry strategically focused on safety essentials. Start a 529 college savings plan early—even small contributions compound over 18 years. Review life insurance needs—term life insurance is affordable and essential for parents. Update beneficiaries on all accounts. Consider estate planning including guardianship designation. Financial stress affects new parents significantly—planning ahead provides peace of mind.",
      author: "BabyCenter",
      saved: false,
      isFeatured: false,
      link: "https://www.babycenter.com/baby-cost-calculator",
    },
    {
      id: 18,
      title:
        "Saving for College: 529 Plans and Other Education Savings Strategies",
      category: "Finances",
      image:
        "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&h=500&fit=crop&q=80",
      image1: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=500&fit=crop&q=80",
      description:
        "Start early and save smart for your child's education with tax-advantaged accounts, investment strategies, and realistic goal-setting.",
      content:
        "College costs continue rising, making early planning essential. A 529 college savings plan offers significant advantages: earnings grow federal tax-free, withdrawals for qualified education expenses are tax-free, high contribution limits, donor maintains control, minimal impact on financial aid, can be used at most accredited schools nationwide. How they work: open an account in your state's plan (though most allow out-of-state enrollment), name your child as beneficiary, make contributions (one-time or recurring), choose investment options (age-based portfolios automatically adjust as college nears), withdraw funds tax-free for tuition, fees, books, room, board, and required equipment. Some states offer tax deductions for contributions. Start early—even small amounts compound significantly over 18 years. If you can save $200/month from birth, you'll accumulate over $80,000 by college (assuming 6% annual return). If you start at age 10, you'd need to save over $500/month to reach the same goal. Consider automatic monthly transfers. Ask relatives to contribute for birthdays or holidays instead of toys. Coverdell ESAs are another option with broader use (K-12 expenses qualify) but lower contribution limits ($2,000/year). Regular savings or investment accounts offer flexibility but lack tax benefits. Don't sacrifice retirement savings for college—your child can borrow for college but you can't borrow for retirement. Research scholarship opportunities early. Consider in-state public universities for value. Community college for first two years saves significantly. Your child can work part-time and summers to contribute.",
      author: "Savingforcollege.com",
      saved: false,
      isFeatured: true,
      link: "https://www.savingforcollege.com/intro-to-529s",
    },
    {
      id: 19,
      title: "Family Budget Basics: Managing Money with Kids",
      category: "Finances",
      image:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=500&fit=crop&q=80",
      description:
        "Create a realistic family budget that accounts for children's needs and wants while teaching financial responsibility along the way.",
      content:
        "Budgeting with children requires balancing current needs, future goals, and teaching opportunities. Start by tracking all income and expenses for one month to understand spending patterns. Categorize expenses: fixed (rent/mortgage, insurance, loan payments), variable essential (groceries, utilities, gas), and discretionary (entertainment, dining out, hobbies). Common family expense categories include housing (30% of income ideally), food (10-15%), transportation (15-20%), insurance (10-15%), savings (10-20%), childcare (varies widely), children's activities, clothing, healthcare, and family entertainment. Create your budget: List all income sources. List all expenses in priority order. Ensure expenses don't exceed income. Allocate amounts to each category. Track actual spending against budgeted amounts. Adjust as needed. Build in flexibility—unexpected expenses arise with children. The 50/30/20 rule offers a simple framework: 50% needs, 30% wants, 20% savings and debt repayment. Involve children age-appropriately. Elementary-age children can understand that family money is finite and choices must be made. Discuss wants versus needs. Let them contribute input on vacation planning or family activity choices within budget constraints. As children age, involve them more in financial discussions. This teaches valuable skills and realistic expectations. Tools like budgeting apps, spreadsheets, or good old paper and pencil all work—consistency matters more than method. Review and adjust your budget quarterly. Celebrate wins when you stay on track or reach savings goals. Don't give up if you overspend—analyze what happened and adjust.",
      author: "Financial Consumer Agency of Canada",
      saved: false,
      isFeatured: false,
      link: "https://www.canada.ca/en/financial-consumer-agency.html",
    },
    {
      id: 20,
      title: "Life Insurance for Parents: Protecting Your Family's Future",
      category: "Finances",
      image:
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop&q=80",
      description:
        "Understand life insurance options and determine appropriate coverage to ensure your children's financial security if the unexpected happens.",
      content:
        "Life insurance is essential for parents, yet nearly half of families lack adequate coverage. If you died tomorrow, how would your family maintain their lifestyle, pay the mortgage, cover childcare, and fund college? Term life insurance is most affordable and appropriate for most parents. It provides coverage for a specific period (10, 20, or 30 years) at fixed premiums. If you die during the term, beneficiaries receive the death benefit tax-free. How much coverage do you need? Common formula: 10-15 times your annual income, or calculate specifically: outstanding debts (mortgage, car loans, student loans), final expenses (funeral costs), childcare costs until children are grown, college education costs, and income replacement (multiply annual income by years until retirement). For a stay-at-home parent, consider childcare replacement cost, household management, and transportation. Both parents need coverage. Consider: 30-year-old with $50,000 income, two young children, $200,000 mortgage might need $750,000-$1,000,000 coverage. A 30-year $500,000 term policy costs approximately $30-40/month for healthy individuals. Permanent life insurance (whole or universal life) is more expensive but builds cash value and lasts lifetime. Most parents are better served by term insurance and investing the premium difference. When shopping: Compare quotes from multiple insurers. Consider A-rated companies. Don't buy through a single agent without comparison shopping. Avoid overbuying—buy what you need based on calculations. Review coverage every few years or after major life changes (new child, home purchase, income changes). Update beneficiaries. Don't procrastinate—get coverage in place now.",
      author: "Policygenius",
      saved: false,
      isFeatured: false,
      link: "https://www.policygenius.com/life-insurance/",
    },

    // ============ ROUTINES ARTICLES (5) ============
    {
      id: 21,
      title:
        "Morning Routines That Work: Getting Out the Door with Less Stress",
      category: "Routines",
      image:
        "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1501290741922-b56c0d0884af?w=800&h=500&fit=crop&q=80",
      description:
        "Transform chaotic mornings into smooth starts with proven strategies for efficient routines that get everyone ready on time.",
      content:
        "Mornings can make or break your day. A solid morning routine reduces stress, prevents forgotten items, and starts everyone off positively. The secret? Most morning success happens the night before. Evening preparation: Lay out next day's clothing (have children do this themselves once able). Pack backpacks and place by door. Prepare lunches and pack in fridge. Set out breakfast items. Check weather forecast and adjust plans. Morning structure: Wake up early enough to avoid rushing—build in 15-minute buffer. Start with personal care: bathroom, dress, brush teeth. Eat breakfast together if possible—even 10 minutes of connection matters. Final checks: shoes, jackets, backpacks, necessary items (library books, permission slips, sports equipment). Walk through a consistent goodbye routine. Tips for success: Use visual checklists for young children—pictures help pre-readers. Set timers or play a morning playlist that ends when it's time to leave. Limit morning screen time—save it for after school. Prepare for resistance: lay out two acceptable outfit options rather than open choice, use natural consequences (child forgets homework, they experience school consequence), stay calm—your stress escalates theirs. Offer breakfast choices within healthy parameters. For very young children, create a routine chart with pictures they move through. For older children, use a checklist they can mark off independently. Build in a few minutes for connection—a quick game, song, or conversation. Adjust bedtime if mornings are consistently rushed—adequate sleep helps everyone function better. Review and adjust routines every few months as children grow and needs change.",
      author: "Positive Parenting Solutions",
      saved: false,
      isFeatured: true,
      link: "https://www.positiveparentingsolutions.com/parenting/morning-routine-for-kids",
    },
    {
      id: 22,
      title: "Bedtime Routines: Sleep Strategies from Infants to School Age",
      category: "Routines",
      image:
        "https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=800&h=500&fit=crop&q=80",
      description:
        "Establish healthy bedtime routines that help children wind down, fall asleep independently, and wake up well-rested.",
      content:
        "Consistent bedtime routines improve sleep quality and make bedtime less stressful. Children with regular routines fall asleep faster, sleep longer, and wake less during the night. Age-appropriate bedtimes: Infants need 12-16 hours total (including naps). Toddlers (1-2 years) need 11-14 hours. Preschoolers (3-5 years) need 10-13 hours. School-age (6-12 years) need 9-12 hours. Calculate bedtime backward from wake time. Creating the routine: Start 30-60 minutes before lights out. Keep the sequence the same every night. Include calming activities only: bath, brush teeth, put on pajamas, read books, sing songs, talk about the day, say goodnight to family/pets/toys. Environment matters: Dark room (use blackout curtains if needed), cool temperature (68-72°F), comfortable bedding, white noise if helpful, safe sleep space (especially for infants—firm mattress, no loose bedding). What to avoid: Screen time one hour before bed—blue light interferes with melatonin, roughhousing or exciting activities, sugary snacks, caffeine (found in chocolate, soda), long conversations about problems or discipline, giving in to stalling tactics (set clear expectations and stick to them). Common challenges: Bedtime resistance—stay calm, be consistent, don't negotiate. Fears—validate feelings, provide small nightlight, check in once. Multiple curtain calls—give one drink, one story, one bathroom trip, then stay firm. Nighttime wakings—wait before responding to see if they self-settle, keep interactions brief and boring, return them to bed immediately. Transitioning from crib to bed—use bed rails, childproof room, return them to bed without interaction if they get up. Be patient—changes take 1-2 weeks to establish.",
      author: "Canadian Paediatric Society",
      saved: false,
      isFeatured: true,
      link: "https://caringforkids.cps.ca/",
    },
    {
      id: 23,
      title:
        "Mealtime Structure: Creating Healthy Eating Routines for Families",
      category: "Routines",
      image:
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop&q=80",
      description:
        "Establish mealtime routines that promote healthy eating habits, reduce picky eating battles, and create family connection.",
      content:
        "Regular meal routines benefit both nutrition and family relationships. Children who eat family meals regularly have better nutrition, healthier weights, stronger family bonds, improved academic performance, and lower risk of substance abuse and depression. Optimal schedule: Three meals and 2-3 snacks daily at consistent times. Space meals/snacks 2-3 hours apart so children arrive hungry but not starving. Avoid constant grazing which reduces appetite for nutritious meals. Structure meals: Eat together as a family when possible—even three meals weekly makes a difference. Sit at the table without screens. Use the division of responsibility: Parents decide what, when, and where to eat. Children decide whether and how much to eat from what's offered. Don't pressure, force, or bribe eating. Offer a variety including one food you know they'll accept. Creating positive mealtimes: Make it pleasant—avoid discipline or difficult conversations during meals. Let children serve themselves from family-style dishes (builds autonomy and reduces battles). Model healthy eating yourself. Engage in conversation—discuss the day, tell stories, play simple games like 'rose and thorn'. Involve children in preparation age-appropriately—preschoolers can wash vegetables, elementary-age children can measure and mix. Keep portions reasonable—children need smaller amounts than adults expect. Offer seconds if still hungry. Handling challenges: Picky eating—continue offering variety without pressure, don't make special meals, remember it can take 10-15 exposures to accept new foods. Manners—teach basic manners (chew with mouth closed, use utensils, ask to be excused) but keep expectations age-appropriate. Rushing—allow adequate time without dragging meals out endlessly (20-30 minutes is typical). Make family meals a priority—they're more important than many activities.",
      author: "Ellyn Satter Institute",
      saved: false,
      isFeatured: false,
      link: "https://www.ellynsatterinstitute.org/family-meals-focus/",
    },
    {
      id: 24,
      title:
        "After-School Routines: Balancing Homework, Activities, and Downtime",
      category: "Routines",
      image:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=500&fit=crop&q=80",
      description:
        "Create after-school routines that meet children's needs for activity, rest, homework completion, and family time.",
      content:
        "After-school hours set the tone for evening and next-day success. School-age children need structure but also flexibility for downtime. The optimal after-school routine balances: healthy snack (children are hungry and low blood sugar affects behavior), transition time (some children need active play to decompress, others need quiet time—follow their lead), homework (consistent time and place, though timing varies by child), physical activity (at least 60 minutes daily—playground, sports, bike riding, active play), unstructured play (essential for creativity and stress relief), family time (conversation, meals, activities), preparation for next day (pack backpack, lay out clothes). Sample routine: 3:30 PM—Arrive home, wash hands, healthy snack. 4:00 PM—Transition time (outdoor play, free choice, or rest depending on child). 4:30 PM—Homework time (adjust timing based on family schedule and child's needs). 5:30 PM—Free play or structured activity. 6:00 PM—Family dinner. 6:30 PM—Help with dishes, prep for next day. 7:00 PM—Family time, reading, or calm activities. 7:30 PM—Begin bedtime routine. Customize based on: Child's age and temperament, presence of activities (sports, lessons), family work schedules, homework load, number of children. Tips for success: Visual schedule helps children know what's expected. Build in buffer time—things take longer than expected. Limit scheduled activities—overscheduling causes stress and leaves no downtime. Consider homework timing—some children work best right after school, others need a break first. Create homework-friendly space stocked with supplies. Minimize screen time on school nights or establish clear time limits. Prepare for next day before relaxing—prevents morning chaos. Build in one-on-one time with each child if possible. Maintain routine on non-school days too—consistency helps.",
      author: "Child Development Institute",
      saved: false,
      isFeatured: false,
      link: "https://childdevelopmentinfo.com/child-activities/after-school-routine/",
    },
    {
      id: 25,
      title:
        "Weekend Routines: Balancing Structure and Flexibility for Family Time",
      category: "Routines",
      image:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1483653364400-eedcfb9f1f88?w=800&h=500&fit=crop&q=80",
      description:
        "Make the most of weekends with routines that allow flexibility while accomplishing necessary tasks and prioritizing family connection.",
      content:
        "Weekends need enough structure to prevent chaos but enough flexibility for relaxation and spontaneity. Benefits of weekend routines: Maintains sleep schedules (important for Monday morning success), ensures essential tasks get done without last-minute stress, creates predictable family time children look forward to, balances obligations with rest. Creating weekend routines: Keep wake/sleep times within one hour of weekday schedule—dramatically shifting sleep schedules causes Monday difficulties. Maintain morning and bedtime routines—these anchor the day. Designate specific times for tasks: Saturday morning chores, Sunday evening meal prep and planning. Build in family time: Weekend breakfast together, family activity Saturday afternoon, game night Sunday evening. Balance obligations and relaxation. Common weekend activities to schedule: Household tasks—cleaning, laundry, meal prep, yard work (involve children age-appropriately), errands—grocery shopping, library visits, appointments, family activities—outings, sports, visiting family/friends, hobbies and personal time—children need unstructured play, parents need self-care. Avoid over-scheduling—resist filling every hour. Downtime is productive; boredom sparks creativity. Quality over quantity—one meaningful family activity beats multiple rushed events. Make Sunday evening preparation time: Review upcoming week calendar, prep what you can (pack lunches, prep breakfast ingredients), involve children in planning, do a house reset (quick pickup, check supplies), early bedtime to recover from weekend. Flexibility within structure: Have a general plan but adjust if someone is sick, weather changes, or spontaneous opportunities arise. The goal is reducing stress, not rigid adherence. Some families thrive on more structure; others need more flexibility—find your balance.",
      author: "Aha! Parenting",
      saved: false,
      isFeatured: false,
      link: "https://www.ahaparenting.com/parenting-tools/family-life/structure-routines",
    },

    // ============ PARENTING ARTICLES (5) ============
    {
      id: 26,
      title:
        "Positive Discipline Strategies That Work Without Yelling or Punishment",
      category: "Parenting",
      image:
        "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=500&fit=crop&q=80",
      description:
        "Discover effective discipline approaches that teach children self-control, responsibility, and problem-solving while maintaining strong parent-child bonds.",
      content:
        "Effective discipline teaches rather than punishes. It guides children toward self-control and good decision-making while preserving your relationship. Positive discipline principles: Focus on teaching not punishing, maintain connection while correcting, address behavior not character, use logical consequences when needed, problem-solve together. Foundation strategies: Set clear, age-appropriate expectations—children can't follow unknown rules. Catch them being good—positive attention for desired behavior is more effective than only noticing misbehavior. Create environments for success—childproof homes for toddlers, establish routines to prevent problems. Give choices within limits—builds autonomy while maintaining boundaries. Use natural consequences when safe—child refuses coat, they're cold (you bring it along just in case). Instead of punishment: Connection before correction—get down to eye level, ensure you have attention. Describe what you see—'I see toys all over the floor' versus 'You're being messy!' State expectations clearly—'Toys need to be picked up before dinner.' Offer limited choices—'Would you like to pick up blocks or cars first?' Follow through calmly and consistently. When misbehavior happens: Pause before reacting—regulate yourself first. Get curious—'What happened? What were you trying to do?' Validate feelings—'You're angry she took your toy.' Set limits—'Hitting hurts. We don't hit.' Teach alternatives—'Use your words. Say 'please give it back.' Apply logical consequences if needed—must be related, respectful, reasonable. Problem-solve together—'How can we prevent this tomorrow?' What doesn't work: Yelling—teaches children to yell. Physical punishment—teaches aggression and damages relationships. Shaming—harms self-esteem without teaching better behavior. Threats not followed through—children learn you don't mean what you say. Over-explaining—keep it brief. Remember: Behavior is communication. Ask what need the behavior meets. Most challenging behavior improves with connection, clear expectations, and teaching skills.",
      author: "Canadian Paediatric Society",
      saved: false,
      isFeatured: true,
      link: "https://caringforkids.cps.ca/",
    },
    {
      id: 27,
      title: "Managing Tantrums and Big Emotions in Toddlers and Preschoolers",
      category: "Parenting",
      image:
        "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=500&fit=crop&q=80",
      description:
        "Understand why young children have meltdowns and learn proven strategies to help them through big emotions calmly and effectively.",
      content:
        "Tantrums are normal developmental stages, not manipulation. Understanding why they happen helps you respond effectively. Why tantrums occur: Limited language to express needs and feelings, developing brain lacks emotional regulation skills, normal desire for independence exceeds capabilities, overwhelmed by big feelings they don't understand, physical needs—hunger, tiredness, overstimulation. Prevention strategies: Maintain consistent routines, ensure adequate sleep and nutrition, give advance warnings of transitions, offer appropriate choices, avoid known triggers when possible (don't grocery shop during naptime), catch escalation early—redirect before meltdown. During a tantrum: Stay calm yourself—your regulation helps their regulation. Ensure safety—remove dangerous objects, stay close. Don't try to reason—their thinking brain is offline. Use few words—'I'm here. You're safe.' Offer comfort if accepted; give space if not. Don't give in to demands that triggered tantrum—this reinforces tantrums. Wait it out patiently. After calm returns: Reconnect physically—hug, lap time. Label emotions—'You were so angry when I said no.' Validate feelings—'It's hard when we can't have what we want.' Set limits on behavior—'It's okay to be angry. It's not okay to hit.' Teach alternatives—'Next time use words. Say 'I'm frustrated.' Problem-solve—'What could we do differently next time?' When tantrums are concerning: Multiple daily tantrums lasting over 15 minutes past age 4, aggressive toward self or others regularly, difficulty calming even with support, interfering with daily life, you're overwhelmed. Consult your pediatrician. Remember: This phase passes. You're teaching emotional regulation skills that last a lifetime. Stay consistent, patient, and connected. Model the regulation you want to see—children learn from watching how you handle your emotions.",
      author: "Canadian Paediatric Society",
      saved: false,
      isFeatured: true,
      link: "https://caringforkids.cps.ca/",
    },
    {
      id: 28,
      title: "Building Strong Sibling Relationships and Managing Rivalry",
      category: "Parenting",
      image:
        "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1542359649-31e03cd4d909?w=800&h=500&fit=crop&q=80",
      description:
        "Foster positive sibling relationships while managing conflict and rivalry with strategies that promote lifelong bonds.",
      content:
        "Sibling relationships are complex—equal parts love and rivalry. Your guidance shapes whether siblings become lifelong friends or distant adults. Understanding sibling rivalry: Competition for parental attention is normal. Birth order, personality differences, and age gaps affect dynamics. Some conflict is healthy—teaches negotiation and conflict resolution. Rivalry intensifies when: One child has special needs requiring extra attention, parents compare siblings, favoritism is shown (even unintentionally), developmental stages clash (toddler disrupts school-age child's activities). Building positive relationships: Create individual time with each child—even 10 minutes daily. Avoid comparisons—'You should behave like your brother.' Celebrate individual strengths—don't make it a competition. Encourage teamwork—projects requiring cooperation, shared responsibilities. Create shared experiences and family traditions. Point out their kindness toward each other—'I noticed you shared your toy. That was thoughtful.' Managing conflict: Don't take sides unless safety is at risk. Let them work it out when possible. Coach problem-solving—'How can you both be happy?' Step in for physical aggression immediately. Separate if needed to cool down. Don't ask 'who started it'—usually both contributed. Hold both accountable for working toward solution. Teach conflict resolution skills: State feelings without blaming—'I feel angry when you take my things.' Listen to each other's perspective. Brainstorm solutions together. Choose a solution fair to both. Try it and evaluate. Preparing for new baby: Involve older child—feel baby move, help prepare nursery. Read books about becoming a big sibling. Maintain their routine as much as possible after baby arrives. Spend one-on-one time during baby's naps. Accept regression—temporary neediness or babyish behavior is normal. Let them help with baby tasks when safe. Validate mixed feelings—'You love baby and sometimes wish she'd go away. Both feelings are okay.' Long-term perspective: Sibling relationships outlast parental relationships typically. Invest in building strong foundations. They won't always get along—that's normal. Your goal is teaching skills for healthy relationships throughout life.",
      author: "Today's Parent Canada",
      saved: false,
      isFeatured: false,
      link: "https://www.todaysparent.com/",
    },
    {
      id: 29,
      title:
        "Self-Care for Parents: Why Your Wellbeing Matters for Your Children",
      category: "Parenting",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=500&fit=crop&q=80",
      description:
        "Learn why parental self-care isn't selfish but essential, with practical strategies for maintaining your physical and mental health.",
      content:
        "You can't pour from an empty cup. Taking care of yourself isn't selfish—it's essential for being the parent your children need. Why self-care matters: Parental stress affects children—they absorb your emotions. Burnout leads to less patience, more yelling, and decreased enjoyment of parenting. Modeling self-care teaches children to value their own wellbeing. Better physical health gives you energy for active parenting. Mental health affects your ability to regulate emotions and handle challenges. Physical self-care: Sleep—prioritize 7-8 hours. Ask for help with night wakings if possible. Nutrition—eat regular, nutritious meals. Prep easy healthy snacks. Exercise—even 10-minute walks count. Include children when possible (bike rides, dancing). Medical care—don't skip your appointments. Address health concerns promptly. Mental and emotional self-care: Social connection—maintain friendships. Schedule regular adult conversations. Therapy or counseling—normalize seeking professional support. Mindfulness or meditation—even 5 minutes daily reduces stress. Hobbies and interests—maintain activities you enjoy. Say no to obligations depleting you. Practical implementation: Start small—don't overhaul life overnight. Build one self-care practice at a time. Schedule it—self-care won't happen spontaneously. Trade childcare with other parents. Use children's bedtime as your self-care time. Lower standards—done is better than perfect. Ask for help—from partner, family, friends. Overcoming barriers: Guilt—remember taking care of yourself helps you take better care of children. Time—it doesn't require hours. 10 minutes counts. Money—many self-care activities are free: walking, library books, baths, phone calls with friends. Lack of support—seek out parenting groups, online communities. Warning signs you need more self-care: Constant exhaustion beyond normal new-parent tiredness, frequent illness, anxiety or depression, irritability and short temper, feeling resentful of children, loss of interest in previously enjoyed activities, physical symptoms (headaches, digestive issues). Remember: Self-care isn't bubble baths and spa days (though those are nice). It's meeting your basic needs for health, rest, connection, and fulfillment so you can show up as your best self for your children.",
      author: "Psychology Today",
      saved: false,
      isFeatured: false,
      link: "https://www.psychologytoday.com/us/basics/parenting",
    },
    {
      id: 30,
      title:
        "Age-Appropriate Chores: Teaching Responsibility from Toddlers to Teens",
      category: "Parenting",
      image:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=500&fit=crop&q=80",
      image1:
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop&q=80",
      description:
        "Discover which chores children can handle at each age and learn strategies for teaching responsibility without constant battles.",
      content:
        "Chores teach children responsibility, competence, and contribution to family. Research shows children who do chores develop better executive function, academic success, and career achievement. Start early—even toddlers can help. Ages 2-3: Put toys in bins, put dirty clothes in hamper, help feed pets (with supervision), wipe spills with paper towels, help make bed (pull up covers). Ages 4-5: Set table (unbreakable dishes), clear own plate, match socks, water plants, put away groceries (non-breakables), dust low surfaces. Ages 6-8: Make own bed, sort laundry by color, help prepare simple foods (spreading peanut butter, washing vegetables), vacuum rooms, take out trash, help with younger siblings, fold and put away own laundry. Ages 9-11: Load/unload dishwasher, clean bathroom, rake leaves, wash car, prepare simple meals with supervision, babysit younger siblings for short periods, help with yard work, manage own homework. Ages 12+: Do own laundry start to finish, prepare family meals, deep clean rooms, mow lawn, manage own schedule and activities, budget allowance, grocery shop from list, extensive babysitting. Teaching chores successfully: Demonstrate thoroughly—work alongside initially. Break tasks into steps—checklist helps. Expect imperfection—they're learning. Resist redoing their work in front of them. Praise effort—'You worked hard on that!' Make it routine—same chores, same schedule. Use visual charts for younger children. Natural consequences—don't nag. If they don't put clothes in hamper, they don't get washed. Avoid paying for basic family contributions—being part of family means contributing. Consider allowance separate from chores. Make it age-appropriate—don't expect more than they're capable of. Work together sometimes—not all chores must be solitary. Overcoming resistance: Start early—easier to begin at 3 than start at 13. Be consistent—don't skip because it's easier to do it yourself. Connect chores to privileges—screen time requires responsibilities completed. Problem-solve together—'What would help you remember?' Stay calm—power struggles make it worse. Focus on learning, not perfection. Benefits beyond clean house: Life skills for independence, sense of capability and confidence, understanding of teamwork and contribution, reduced entitlement, preparation for living independently.",
      author: "Center for Parenting Education",
      saved: false,
      isFeatured: true,
      link: "https://centerforparentingeducation.org/library-of-articles/responsibility-and-chores/part-i-benefits-of-chores/",
    },
  ],
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Article.deleteMany({});
    console.log("🗑️  Cleared existing articles");

    const articles = articlesData.articles.map((article) => ({
      title: article.title,
      category: article.category,
      image: article.image,
      image1: article.image1,
      description: article.description,
      content: article.content,
      author: article.author,
      isFeatured: article.isFeatured,
      link: article.link || null,
      status: "published",
      viewCount: 0,
    }));

    await Article.insertMany(articles);
    console.log(`✅ Successfully seeded ${articles.length} articles`);

    const categories = {};
    articles.forEach((article) => {
      categories[article.category] = (categories[article.category] || 0) + 1;
    });

    console.log("\n📊 Summary by Category:");
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} articles`);
      });

    mongoose.connection.close();
    console.log("\n✅ Database seeding complete!");
    console.log("🎯 Ready for BloomUp parenting platform");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
