window.AI_SOURCES = [
  {
    id:'google-problem-framing', tier:'B', type:'Official guide',
    title:'Introduction to Machine Learning Problem Framing', author:'Google for Developers', year:2025,
    url:'https://developers.google.com/machine-learning/problem-framing',
    role:'Use case → có nên dùng ML → predictive ML / generative AI → output → success metrics.',
    useFor:['Problem framing','Classification','Regression','Generation','Recommendation','Forecasting'],
    tags:['Machine Learning','Classification','Regression','Generative AI','Recommendation','Forecasting']
  },
  {
    id:'ml-design-patterns', tier:'B', type:'Book',
    title:'Machine Learning Design Patterns', author:'Valliappa Lakshmanan, Sara Robinson, Michael Munn', year:2020,
    url:'https://www.oreilly.com/library/view/machine-learning-design/9781098115777/',
    role:'Problem → solution → why it works → trade-offs/alternatives; recurring patterns across the ML lifecycle.',
    useFor:['Why this approach?','Trade-offs','Embeddings','Feature engineering','Training','Serving','Responsible AI'],
    tags:['Machine Learning','Embedding','Feature Engineering','Overfitting','Train/Validation/Test','Inference']
  },
  {
    id:'building-ml-apps', tier:'B', type:'Book',
    title:'Building Machine Learning Powered Applications', author:'Emmanuel Ameisen', year:2020,
    url:'https://www.oreilly.com/library/view/building-machine-learning/9781492045106/',
    role:'Product idea → ML framing → baseline → dataset → model → error analysis → deployment → monitoring.',
    useFor:['End-to-end project','Baseline','Dataset','Error analysis','Deployment'],
    tags:['Machine Learning','Supervised Learning','Unsupervised Learning','Train/Validation/Test','Inference']
  },
  {
    id:'designing-ml-systems', tier:'B', type:'Book',
    title:'Designing Machine Learning Systems', author:'Chip Huyen', year:2022,
    url:'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
    role:'Business objective → ML objective → data → metric → training → serving → monitoring → continual learning.',
    useFor:['Production ML','Data engineering','Metrics','Serving','Monitoring','MLOps'],
    tags:['Machine Learning','Feature Engineering','Train/Validation/Test','Inference','Calibration','Forecasting','Recommendation']
  },
  {
    id:'ai-engineering', tier:'B', type:'Book',
    title:'AI Engineering', author:'Chip Huyen', year:2024,
    url:'https://www.oreilly.com/library/view/ai-engineering/9781098166298/',
    role:'Foundation-model applications: evaluation, prompting, RAG, agents, dataset engineering, inference optimization and architecture.',
    useFor:['Foundation Models','LLM','RAG','Prompting','Agents','Evaluation','Inference optimization'],
    tags:['Foundation Model','LLM','Generative AI','RAG','Prompt Engineering','Fine-tuning','Transformer','Embedding']
  },
  {
    id:'hf-tasks', tier:'B', type:'Official taxonomy',
    title:'Hugging Face Tasks', author:'Hugging Face', year:2026,
    url:'https://huggingface.co/tasks',
    role:'Task taxonomy → demos → use cases → models → datasets; useful for discovering candidate models and datasets.',
    useFor:['Task taxonomy','Model discovery','Dataset discovery','Demos'],
    tags:['Classification','Regression','Object Detection','Segmentation','Text Generation','Translation','Summarization','Embedding','Reinforcement Learning','Speech-to-text']
  },

  { id:'paper-alexnet', tier:'A', type:'Primary paper', title:'ImageNet Classification with Deep Convolutional Neural Networks', author:'Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton', year:2012, url:'https://papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf', role:'Canonical deep-CNN case: supervised image classification, ReLU, dropout, data augmentation and GPU training.', useFor:['CNN','Deep Learning','Image Classification'], tags:['CNN','Deep Learning','Data Augmentation','Overfitting','Classification'] },
  { id:'paper-unet', tier:'A', type:'Primary paper', title:'U-Net: Convolutional Networks for Biomedical Image Segmentation', author:'Olaf Ronneberger, Philipp Fischer, Thomas Brox', year:2015, url:'https://arxiv.org/abs/1505.04597', role:'Encoder/decoder segmentation architecture with strong data augmentation and precise localization.', useFor:['Segmentation','U-Net'], tags:['Segmentation','CNN','Data Augmentation','U-Net'] },
  { id:'paper-yolo', tier:'A', type:'Primary paper', title:'You Only Look Once: Unified, Real-Time Object Detection', author:'Joseph Redmon, Santosh Divvala, Ross Girshick, Ali Farhadi', year:2015, url:'https://arxiv.org/abs/1506.02640', role:'Frames object detection as a single end-to-end network predicting boxes and class probabilities in real time.', useFor:['Object Detection','YOLO','Real-time vision'], tags:['Object Detection','YOLO','CNN','mAP','IoU','Inference'] },
  { id:'paper-faster-rcnn', tier:'A', type:'Primary paper', title:'Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks', author:'Shaoqing Ren, Kaiming He, Ross Girshick, Jian Sun', year:2015, url:'https://arxiv.org/abs/1506.01497', role:'Canonical two-stage detector using a Region Proposal Network sharing convolutional features.', useFor:['Object Detection','Faster R-CNN','Two-stage detection'], tags:['Object Detection','Faster R-CNN','CNN'] },
  { id:'paper-resnet', tier:'A', type:'Primary paper', title:'Deep Residual Learning for Image Recognition', author:'Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun', year:2015, url:'https://arxiv.org/abs/1512.03385', role:'Residual connections make substantially deeper networks easier to optimize.', useFor:['ResNet','Deep CNN','Residual connections'], tags:['ResNet','CNN','Deep Learning','Classification'] },
  { id:'paper-facenet', tier:'A', type:'Primary paper', title:'FaceNet: A Unified Embedding for Face Recognition and Clustering', author:'Florian Schroff, Dmitry Kalenichenko, James Philbin', year:2015, url:'https://arxiv.org/abs/1503.03832', role:'Learns face embeddings where vector distance directly represents identity similarity.', useFor:['Face verification','Metric learning','Embedding'], tags:['FaceNet','Embedding','Deep Learning','Classification'] },
  { id:'paper-transformer', tier:'A', type:'Primary paper', title:'Attention Is All You Need', author:'Ashish Vaswani et al.', year:2017, url:'https://arxiv.org/abs/1706.03762', role:'Introduces the Transformer: sequence modeling based on attention without recurrence or convolution.', useFor:['Transformer','Attention','Sequence generation'], tags:['Transformer','Attention','Translation','Generative AI','LLM'] },
  { id:'paper-ppo', tier:'A', type:'Primary paper', title:'Proximal Policy Optimization Algorithms', author:'John Schulman, Filip Wolski, Prafulla Dhariwal, Alec Radford, Oleg Klimov', year:2017, url:'https://arxiv.org/abs/1707.06347', role:'Practical policy-gradient method balancing simplicity, sample complexity and stable policy updates.', useFor:['Reinforcement Learning','PPO','Robotics'], tags:['Reinforcement Learning','PPO','Neural Network','Optimizer'] },
  { id:'paper-bert', tier:'A', type:'Primary paper', title:'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', author:'Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova', year:2018, url:'https://arxiv.org/abs/1810.04805', role:'Bidirectional Transformer pretraining followed by lightweight task-specific fine-tuning.', useFor:['BERT','Text classification','NER','Question answering'], tags:['BERT','Transformer','Fine-tuning','Classification','Token Classification'] },
  { id:'paper-sbert', tier:'A', type:'Primary paper', title:'Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks', author:'Nils Reimers, Iryna Gurevych', year:2019, url:'https://arxiv.org/abs/1908.10084', role:'Produces semantically meaningful sentence embeddings suitable for cosine similarity and scalable semantic search.', useFor:['Semantic search','Sentence similarity','Embedding'], tags:['Sentence Transformer','Embedding','Ranking','Semantic search'] },
  { id:'paper-gpt3', tier:'A', type:'Primary paper', title:'Language Models are Few-Shot Learners', author:'Tom B. Brown et al.', year:2020, url:'https://arxiv.org/abs/2005.14165', role:'Canonical large autoregressive language-model scaling and in-context/few-shot learning case study.', useFor:['LLM','Few-shot prompting','Text generation'], tags:['LLM','Foundation Model','Generative AI','Prompt Engineering','Transformer'] },
  { id:'paper-rag', tier:'A', type:'Primary paper', title:'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', author:'Patrick Lewis et al.', year:2020, url:'https://arxiv.org/abs/2005.11401', role:'Combines parametric generation with external non-parametric memory retrieved from a dense vector index.', useFor:['RAG','Knowledge-intensive QA','Retrieval + generation'], tags:['RAG','Embedding','LLM','Generative AI','Ranking'] },
  { id:'paper-detr', tier:'A', type:'Primary paper', title:'End-to-End Object Detection with Transformers', author:'Nicolas Carion et al.', year:2020, url:'https://arxiv.org/abs/2005.12872', role:'Recasts detection as direct set prediction with bipartite matching and a Transformer encoder-decoder.', useFor:['DETR','Object Detection','Transformer vision'], tags:['DETR','Object Detection','Transformer','Attention','IoU'] },
  { id:'paper-ddpm', tier:'A', type:'Primary paper', title:'Denoising Diffusion Probabilistic Models', author:'Jonathan Ho, Ajay Jain, Pieter Abbeel', year:2020, url:'https://arxiv.org/abs/2006.11239', role:'Foundational diffusion-model formulation for high-quality generative image modeling.', useFor:['Diffusion','Image generation'], tags:['Diffusion Model','Generative AI','Image generation','Loss Function'] },
  { id:'paper-vit', tier:'A', type:'Primary paper', title:'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale', author:'Alexey Dosovitskiy et al.', year:2020, url:'https://arxiv.org/abs/2010.11929', role:'Applies a pure Transformer directly to sequences of image patches for image recognition.', useFor:['Vision Transformer','Image classification'], tags:['Vision Transformer','ViT','Transformer','Classification','Deep Learning'] },
  { id:'paper-clip', tier:'A', type:'Primary paper', title:'Learning Transferable Visual Models From Natural Language Supervision', author:'Alec Radford et al.', year:2021, url:'https://arxiv.org/abs/2103.00020', role:'Contrastive image-text pretraining enabling transferable representations and zero-shot visual classification.', useFor:['CLIP','Visual search','Zero-shot vision','Multimodal'], tags:['CLIP','Embedding','Self-supervised Learning','Vision Transformer','Multimodal'] },
  { id:'paper-ldm', tier:'A', type:'Primary paper', title:'High-Resolution Image Synthesis with Latent Diffusion Models', author:'Robin Rombach et al.', year:2021, url:'https://arxiv.org/abs/2112.10752', role:'Runs diffusion in pretrained latent space and uses cross-attention for flexible conditioning such as text.', useFor:['Latent Diffusion','Text-to-image'], tags:['Diffusion Model','Generative AI','Attention','Text-to-Image'] },
  { id:'paper-whisper', tier:'A', type:'Primary paper', title:'Robust Speech Recognition via Large-Scale Weak Supervision', author:'Alec Radford et al.', year:2022, url:'https://arxiv.org/abs/2212.04356', role:'Large-scale multilingual/multitask weak supervision for robust zero-shot speech recognition.', useFor:['Whisper','Speech-to-text','ASR'], tags:['Whisper','Speech-to-text','Transformer','Foundation Model'] },
  { id:'paper-sam', tier:'A', type:'Primary paper', title:'Segment Anything', author:'Alexander Kirillov et al.', year:2023, url:'https://arxiv.org/abs/2304.02643', role:'Promptable segmentation foundation model and large-scale segmentation data engine.', useFor:['Segmentation','Foundation model for vision','Promptable vision'], tags:['Segmentation','Foundation Model','Computer Vision'] }
];

window.AI_SOURCE_LEVELS = {
  A: 'Primary: paper gốc / nguồn kỹ thuật chính chủ — dùng để verify architecture, method và experimental claims.',
  B: 'Strong reference: official guide / textbook / official taxonomy — dùng cho framing, design patterns và system thinking.'
};
