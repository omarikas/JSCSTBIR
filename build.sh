
sudo curl -L -o ./model.tar.gz\
  https://www.kaggle.com/api/v1/models/omarbazid/jscstbir/tfJs/v-1/1/download
sudo tar -xzf ./model.tar.gz -C /opt/render/project/src/model

sudo npm install --force
