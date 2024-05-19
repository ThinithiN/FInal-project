
from voice_comad import predict_audio



while True:

    #test_audi = 'fight_3.wav'
    test_audi = input('enter audio file - ')

    ss = predict_audio(test_audi)

    print('sssss',ss)