# Autokin Spectacles
# www.autokinjs.com
FROM node:alpine

RUN apk -v --update add nss jq curl 
COPY build /etc/opt/spectacles
COPY server/package.json /etc/opt/spectacles
COPY server/start.sh /etc/opt/spectacles
COPY web/build /etc/opt/spectacles/docs
RUN cd /etc/opt/spectacles && yarn

CMD ["/etc/opt/spectacles/start.sh"];